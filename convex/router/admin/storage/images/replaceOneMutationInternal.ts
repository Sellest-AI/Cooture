import { v } from "convex/values";
import { internal } from "../../../../_generated/api";
import { Doc, Id } from "../../../../_generated/dataModel";
import { internalMutation, internalQuery } from "../../../../_generated/server";
import { IMAGE_TAGS } from "../../../../schema/images";

type Image = Doc<'images'> & { userId: Id<'users'> | null };

export const _internal_step1 = internalQuery({
  args: {
    imageId: v.id('images'),
  },
  handler: async (ctx, { imageId }): Promise<Image | null> => {
    const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
    if (!image) return null;

    const user = await ctx.db.query('userImages')
      .withIndex('by_image_id', (q) => q.eq('imageId', image._id))
      .first();

    return {
      ...image,
      userId: user?.userId ?? null,
    }
  }
})

export const _internal_step3 = internalMutation({
  args: {
    imageId: v.id('images'),
  },
  handler: async (ctx, { imageId }) => {
    const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
    if (!image) return null;

    await Promise.all(image._sizes.map((size) => ctx.db.delete("imageSizes", size._id)));
    await Promise.all(image.objects.map((object) => ctx.db.delete("imageObjects", object._id)));
  }
})

export const _internal_step4 = internalMutation({
  args: {
    userId: v.union(v.null(), v.id("users")),
    imageId: v.id('images'),
    image: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const { image } = args;

    const tags = [...new Set([...(image.tags ?? []), 'IMAGE', image.hasAlpha ? 'OBJECT' : null] as const)]
      .filter((v) => v !== null);

    await ctx.db.patch(args.imageId, {
      url: image.url,
      hashBase64: image.hashBase64,
      key: image.key,
      width: image.width,
      height: image.height,
      size: image.size,
      mimeType: image.mimeType,
      alt: image.alt,
      tags: tags,
      updatedAt: Date.now(),
      hasAlpha: image.hasAlpha ?? false,
    })

    await ctx.scheduler.runAfter(0, internal.router.storage.images.uploadSizes._internal, {
      imageIds: [args.imageId],
    });
  }
});