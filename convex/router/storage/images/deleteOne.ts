"use node"
import { StorageCloud } from "@/lib/s3/node";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { internalAction } from "../../../_generated/server";

export const _internal = internalAction({
  args: { imageId: v.id("images") },
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

    await ctx.runMutation(internal.router.storage.images.deleteOneMutation._internal, { imageId });
  },
})

