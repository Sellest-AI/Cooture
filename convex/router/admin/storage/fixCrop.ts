"use node"
import { cropImageFromBuffer, imageBufferFromUrl } from "@/lib/image/node";
import { StorageCloud } from "@/lib/s3/node";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { internalAction } from "../../../_generated/server";
import { uploadImage } from "../../storage/images/uploadMany";

export const _internal = internalAction({
  handler: async (ctx) => {
    const images = await ctx.runMutation(internal.router.admin.storage.fixCropMutationInternal._internal_step1);

    for (const image of images) {
      if (!image.hasAlpha) continue;

      try {
        const buffer = await imageBufferFromUrl(image.url);
        const croppedImage = await cropImageFromBuffer(buffer);
        if (!croppedImage.cropped) continue;

        const data = await uploadImage(ctx, image.url, { tags: image.tags, userId: image.userId, autoCrop: true });

        // Delete from S3
        await ctx.runAction(internal.router.admin.storage.fixCrop._internal_step2, { imageId: image._id });

        // Delete from DB
        await ctx.runMutation(internal.router.admin.storage.fixCropMutationInternal._internal_step3, { imageId: image._id });

        // Update in DB with cropped version
        await ctx.runMutation(internal.router.admin.storage.fixCropMutationInternal._internal_step4, {
          imageId: image._id,
          userId: image.userId,
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

        console.log(`Fixed crop for image ${image._id} (user: ${image.userId})`);
        console.log(`Original size: ${image.width}x${image.height}, new size: ${data.width}x${data.height}`);
      } catch (error) {
        console.error(`Failed to fix crop for image ${image._id} (user: ${image.userId}):`, error);
      }
    }
  }
})


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
