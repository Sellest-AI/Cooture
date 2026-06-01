import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { SavedImage } from "../../../functions/images";
import { authAction } from "../../../procedures";
import { IMAGE_TAGS } from "../../../schema/images";

export const uploadSingleArgs = {
  base64: v.optional(v.string()),
  url: v.optional(v.string()),
  object: v.optional(v.object({
    baseImageId: v.id('images'),
    x: v.number(),
    y: v.number(),
  })),
  tags: v.optional(IMAGE_TAGS),
  autoCrop: v.optional(v.boolean()),
}

export const authed = authAction({
  args: uploadSingleArgs,
  handler: async (ctx, args): Promise<SavedImage> => {
    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      userId: ctx.userId,
      images: [args],
    })

    return images[0];
  }
});
