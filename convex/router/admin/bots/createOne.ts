import { createCustomer } from "@/lib/stripe";
import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";
import { createUserWallet } from "../../../functions/credits";
import { adminAction, internalMutation } from "../../../procedures";

const sharedArgs = {
  name: v.string(),
  email: v.string(),
  displayName: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  username: v.string(),
  heightCm: v.number(),
  age: v.number(),
  gender: v.union(v.literal("male"), v.literal("female")),
  size: v.union(
    v.literal("lean"),
    v.literal("average"),
    v.literal("athletic"),
    v.literal("muscular"),
    v.literal("heavy"),
    v.literal("heavyset"),
  ),
}

export const admin = adminAction({
  args: {
    ...sharedArgs,
    images: v.object({
      frontUrl: v.string(),
      sideUrl: v.string(),
      smileUrl: v.string(),
      profileUrl: v.string(),
    })
  },
  handler: async (ctx, args): Promise<Id<'users'>> => {
    const { available, sanitizedUsername } = await ctx.runQuery(api.router.users.checkUsername.anon, {
      username: args.username,
    });

    if (!available) throw new Error("Username is already taken");

    const extractImage = (url: string) => {
      if (url.startsWith('http')) return { url };
      return { base64: url }
    }

    const profileImages = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [extractImage(args.images.profileUrl)], userId: null,
    });

    const { images: argsImages, ...shared } = args;

    // User
    const user = await ctx.runMutation(internal.router.admin.bots.createOne._internal_step_1, {
      ...shared,
      image: profileImages[0].url,
      username: sanitizedUsername,
    });

    // Stripe User
    const stripeCustomer = await createCustomer({
      id: user,
      email: args.email,
      name: args.name,
    })

    // Appearance images
    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [
        extractImage(argsImages.frontUrl),
        extractImage(argsImages.sideUrl),
        extractImage(argsImages.smileUrl),
      ],
      userId: user,
    });

    // Appearance
    await ctx.runMutation(internal.router.admin.bots.createOne._internal_step_2, {
      ...shared,
      username: sanitizedUsername,
      userId: user,
      stripeCustomerId: stripeCustomer.id,
      images: {
        profileImageId: profileImages[0]._id,
        frontImageId: images[0]._id,
        sideImageId: images[1]._id,
        smileImageId: images[2]._id,
      }
    })

    // Cron trigger after 2 minutes to start liking content
    await ctx.scheduler.runAfter(1000 * 60 * 2, internal.router.admin.bots.crons._internal, { id: user });

    return user;
  }
})

export const _internal_step_1 = internalMutation({
  args: { ...sharedArgs, image: v.string() },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      email: args.email.trim(),
      image: args.image,
    })

    await ctx.db.insert("bots", {
      userId,
      age: args.age,
    })

    await createUserWallet(ctx, userId);

    return userId;
  }
})

export const _internal_step_2 = internalMutation({
  args: {
    ...sharedArgs,
    userId: v.id('users'),
    stripeCustomerId: v.string(),
    images: v.object({
      frontImageId: v.id('images'),
      sideImageId: v.id('images'),
      smileImageId: v.id('images'),
      profileImageId: v.id('images'),
    })
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.images.profileImageId);

    await ctx.db.insert("usersExtended", {
      userId: args.userId,
      canTakeFreeTrial: false,
      stripeCustomerId: args.stripeCustomerId,
      accountStatus: "ACTIVE",
      role: "BOT",
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      username: args.username.trim(),
      name: args.displayName ?? args.name.trim(),
      imageId: image?._id,
      imageUrl: image?.url,
    })

    await ctx.db.insert("usersAppearance", {
      userId: args.userId,
      frontImageId: args.images.frontImageId,
      sideImageId: args.images.sideImageId,
      smileImageId: args.images.smileImageId,
      heightCm: args.heightCm,
      gender: args.gender,
      size: args.size,
    });
  }
});