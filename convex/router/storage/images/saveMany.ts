import { Infer, v } from "convex/values";
import { SavedImage, saveImage } from "../../../functions/images/saveImage";
import { internalMutation, serverMutation } from "../../../procedures";
import { IMAGE_TAGS } from "../../../schema/images";

const args = {
  userId: v.union(v.null(), v.id("users")),
  images: v.array(v.object({
    url: v.string(),
    key: v.string(),
    hashBase64: v.string(),
    width: v.number(),
    height: v.number(),
    size: v.number(),
    mimeType: v.string(),
    alt: v.optional(v.string()),
    hasAlpha: v.optional(v.boolean()),
    tags: v.optional(IMAGE_TAGS),
    object: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      baseImageId: v.id('images')
    })),
  })),
}

const argsObj = v.object(args);
type Args = Infer<typeof argsObj>;

const sharedHandler = async (ctx: any, args: Args): Promise<SavedImage[]> => {
  const images = await Promise.all(args.images.map((arg) => saveImage(ctx, { ...arg, userId: args.userId })));

  // const sizes = images.reduce((acc, img) => acc + img.size, 0)
  // await updateUsageFromWorkspace(ctx, { workspaceId: args.workspaceId, size: sizes });

  return images;
}

export const server = serverMutation({
  args, handler: sharedHandler,
})

export const _internal = internalMutation({
  args, handler: sharedHandler,
})
