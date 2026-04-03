import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { getImage } from "../../functions/images";
import { authAction, internalMutation } from "../../procedures";

export const authed = authAction({
  args: {
    base64: v.string(),
  },
  handler: async (ctx, args) => {
    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [{ base64: args.base64 }],
      userId: ctx.userId
    })

    await ctx.scheduler.runAfter(20 * 1000, internal.router.users.upsertImage._internal_step, {
      imageId: images[0]._id,
      userId: ctx.user._idExtended
    });
  }
})

export const _internal_step = internalMutation({
  args: {
    imageId: v.id("images"),
    userId: v.id("usersExtended"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const image = await getImage(ctx, args.imageId);

    await ctx.db.patch(user._id, {
      imageUrl: image?.sizes.thumbnail.url,
      imageId: image?._id,
    })

    if (user.imageId)
      await ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal,
        { imageId: user.imageId });
  }
})