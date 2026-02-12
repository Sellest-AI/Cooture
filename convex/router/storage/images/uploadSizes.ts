"use node"

import { compressImage } from "@/lib/image/node";
import { StorageCloud } from "@/lib/s3/node";
import { retryPromise } from "@shared/utils";
import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";
import { ActionCtx, internalAction } from "../../../_generated/server";

const uploadSizes = async (ctx: ActionCtx, imageId: Id<'images'>) => {
  const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
  if (!image) return [];

  await StorageCloud.updateCacheControl(image.key);

  type Size = { px: number, quality: number };
  const sizes: Size[] = [
    { px: 150, quality: 40 },
    { px: 336, quality: 40 },
    { px: 600, quality: 50 },
    { px: 1440, quality: 98 },
  ];

  type Data = typeof api.router.storage.images.saveSizes.server._args;
  const data: Data['images'][number]['sizes'][number][] = [];

  for (const size of sizes) {
    const { px, quality } = size;

    const alreadyExist = image._sizes.find((s) => Math.max(s.width, s.height) === px && s.quality === quality);
    if (alreadyExist) continue;

    const threshold = px < 1000 ? px : px * 1.3;
    const isTooSmall = Math.max(image.width, image.height) <= threshold;
    if (isTooSmall) continue;

    const buffer = await compressImage(image.url, { maxSideSize: px, quality: quality })

    const directory = StorageCloud.FOLDERS.getFromKey(image.key);
    const file = await StorageCloud.uploadFile(buffer, directory);

    data.push({
      key: file.key,
      quality: quality,
      size: buffer.metadata.size ?? file.Size ?? image.size,
      width: buffer.metadata.width ?? image.width,
      height: buffer.metadata.height ?? image.height,
      url: file.location,
    })
  }

  return data;
}

export const _internal = internalAction({
  args: { imageIds: v.array(v.id('images')) },
  handler: async (ctx, args) => {
    const results = await Promise.all(args.imageIds.map(async (id) => {
      const sizes = await uploadSizes(ctx, id);
      return {
        imageId: id,
        sizes: sizes
      }
    }));

    await retryPromise(() =>
      ctx.runMutation(internal.router.storage.images.saveSizes._internal, { images: results }));

    return true;
  }
})