import { Infer, v } from "convex/values";
import { internalMutation, MutationCtx, serverMutation } from "../../../procedures";
import { Id } from "../../../_generated/dataModel";

const args = {
  images: v.array(v.object({
    imageId: v.id("images"), // Reference to the parent Image
    sizes: v.array(v.object({
      quality: v.number(),
      key: v.string(), // Unique key
      width: v.number(),
      height: v.number(),
      url: v.string(),
      size: v.number(),
    }))
  }))
}

const argsObj = v.object(args);
type Args = Infer<typeof argsObj>;

type ReturnType = Promise<{ size: number; _id: Id<'images'> }[]>

const sharedHandler = async (ctx: MutationCtx, args: Args): ReturnType => {
  const images = await Promise.all(args.images.map(async (image) => {
    const sizes = image.sizes;
    await Promise.all(sizes.map(async (size) => {
      const imageId = await ctx.db.insert('imageSizes', { ...size, imageId: image.imageId });
      return imageId;
    }));

    return {
      size: sizes.reduce((acc, size) => acc + size.size, 0),
      _id: image.imageId,
    }
  }))

  // await updateUsageFromImages(ctx, images)

  return images;
}

export const server = serverMutation({
  args, handler: sharedHandler,
})

export const _internal = internalMutation({
  args, handler: sharedHandler,
})