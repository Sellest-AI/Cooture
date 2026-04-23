import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";
import { internalAction } from "../../../_generated/server";
import { env } from "../../../env";
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

    if (!env.BOT_DEFAULT_PASSWORD)
      throw new Error("BOT_DEFAULT_PASSWORD is not set in the environment variables");

    const extractImage = (url: string) => {
      if (url.startsWith('http')) return { url };
      return { base64: url }
    }

    const { images: argsImages, ...shared } = args;

    // User
    const userId = await ctx.runAction(internal.router.admin.bots.createOne._internal_step_1, {
      ...shared,
      username: sanitizedUsername,
    });

    const profileImages = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [extractImage(args.images.profileUrl)],
      userId,
    });

    await ctx.runMutation(internal.router.admin.bots.createOne._internal_step_2, {
      ...shared,
      username: sanitizedUsername,
      image: profileImages[0].url,
      userId,
    });

    // Appearance images
    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [
        extractImage(argsImages.frontUrl),
        extractImage(argsImages.sideUrl),
        extractImage(argsImages.smileUrl),
      ],
      userId,
    });

    // Update user info after 1-2 minutes to ensure the account is fully created and avoid potential race
    await ctx.scheduler.runAfter(1000 * 60 * 1, internal.router.admin.bots.createOne._internal_step_3, {
      ...shared,
      username: sanitizedUsername,
      userId,
      images: {
        profileImageId: profileImages[0]._id,
        frontImageId: images[0]._id,
        sideImageId: images[1]._id,
        smileImageId: images[2]._id,
      }
    })

    // Cron trigger after 10 minutes to start liking content
    await ctx.scheduler.runAfter(1000 * 60 * 10, internal.router.admin.bots.crons._internal, { id: userId });

    return userId;
  }
})

export const _internal_step_1 = internalAction({
  args: { ...sharedArgs },
  handler: async (ctx, args) => {
    const user = await createAccount(ctx, {
      provider: "password",
      account: {
        id: args.email,
        secret: env.BOT_DEFAULT_PASSWORD,
      },
      profile: {
        email: args.email,
      },
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    })

    return user.user._id;
  }
});

export const _internal_step_2 = internalMutation({
  args: { ...sharedArgs, image: v.string(), userId: v.id('users') },
  handler: async (ctx, args) => {
    const { userId } = args;

    await ctx.db.patch(args.userId, {
      name: args.name.trim(),
      email: args.email.trim(),
      image: args.image,
    })

    await ctx.db.insert("bots", {
      userId,
      age: args.age,
    })

    return userId;
  }
})

export const _internal_step_3 = internalMutation({
  args: {
    ...sharedArgs,
    userId: v.id('users'),
    images: v.object({
      frontImageId: v.id('images'),
      sideImageId: v.id('images'),
      smileImageId: v.id('images'),
      profileImageId: v.id('images'),
    })
  },
  handler: async (ctx, args) => {
    const userExtended = await ctx.db.query('usersExtended')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId)).first();

    if (!userExtended) return;

    const image = await ctx.db.get(args.images.profileImageId);

    await ctx.db.patch(userExtended._id, {
      canTakeFreeTrial: false,
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