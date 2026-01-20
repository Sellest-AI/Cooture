import { Infer } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { IMAGE_TAGS } from "../../schema/images";
import { MutationCtx } from "../../_generated/server";

export type SaveImageArgs = {
  url: string;
  hashBase64: string;
  key: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  alt?: string;
  hasAlpha?: boolean;
  tags?: Infer<typeof IMAGE_TAGS>;
  userId: Id<'users'>;
  object?: {
    x: number;
    y: number;
    baseImageId: Id<'images'>;
  };
};

/**
 * Warning: This function doesn't update the workspace usage.
 * You should call `updateUsageFromImage` or `updateUsageFromWorkspace` after calling this function.	
 */
export const saveImage = async (ctx: MutationCtx, args: SaveImageArgs) => {
  const tags = [...new Set([...(args.tags ?? []), 'IMAGE', args.hasAlpha ? 'OBJECT' : null] as const)]
    .filter((v) => v !== null);

  const image = await ctx.db.insert('images', {
    url: args.url,
    hashBase64: args.hashBase64,
    key: args.key,
    width: args.width,
    height: args.height,
    size: args.size,
    mimeType: args.mimeType,
    alt: args.alt,
    tags: tags,
    updatedAt: Date.now(),
    hasAlpha: args.hasAlpha ?? false,
  });

  const imageUser = await ctx.db.insert('userImages', {
    imageId: image,
    userId: args.userId,
  });

  if (args.object) {
    await ctx.db.insert('imageObjects', {
      ...args.object,
      updatedAt: Date.now(),
      imageId: image,
    })
  }

  const imageDb = await ctx.db.get(image);
  if (!imageDb) throw new Error(`Image not found`);

  return {
    ...imageDb,
    imageId: imageDb._id,
    userImageId: imageUser,
  }
}

export type SavedImage = Awaited<ReturnType<typeof saveImage>>;