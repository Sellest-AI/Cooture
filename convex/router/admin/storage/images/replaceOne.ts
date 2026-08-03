"use node"
import { StorageCloud } from "@/lib/s3/node";
import { v } from "convex/values";
import { internal } from "../../../../_generated/api";
import { internalAction } from "../../../../_generated/server";
import { uploadImage } from "../../../storage/images/uploadMany";

export const _internal = internalAction({
  args: {
    imageId: v.id('images'),
    base64: v.string(),
  },
  handler: async (ctx, args) => {
    const image = await ctx.runQuery(internal.router.admin.storage.images.replaceOneMutationInternal._internal_step1, { imageId: args.imageId });
    if (!image) throw new Error(`Image with id ${args.imageId} not found`);

    try {
      const data = await uploadImage(ctx, args.base64, {
        tags: image.tags,
        userId: image.userId ?? null,
        autoCrop: true
      });

      // Delete from S3
      await ctx.runAction(internal.router.admin.storage.images.replaceOne._internal_step2, { imageId: image._id });

      // Delete from DB
      await ctx.runMutation(internal.router.admin.storage.images.replaceOneMutationInternal._internal_step3, { imageId: image._id });

      // Update in DB with cropped version
      await ctx.runMutation(internal.router.admin.storage.images.replaceOneMutationInternal._internal_step4, {
        imageId: image._id,
        userId: image.userId ?? null,
        image: {
          url: data.url,
          key: data.key,
          hashBase64: data.hashBase64,
          width: data.width,
          height: data.height,
          size: data.size,
          mimeType: data.mimeType,
          alt: image.alt,
          hasAlpha: data.hasAlpha,
          tags: data.tags,
        }
      });
    } catch { }
  }
});


export const _internal_step2 = internalAction({
  args: {
    imageId: v.id('images'),
  },
  handler: async (ctx, { imageId }) => {
    const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
    if (!image) return null;

    await StorageCloud.deleteFile(image.key);

    // Delete every sizes keys
    for (const imageSize of Object.values(image._sizes)) {
      await StorageCloud.deleteFile(imageSize.key);
    }

    // Delete linked object
    for (const object of image.objects) {
      const imageObject = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: object.imageId });
      if (!imageObject) continue;

      await StorageCloud.deleteFile(imageObject.key);
    }
  }
});
