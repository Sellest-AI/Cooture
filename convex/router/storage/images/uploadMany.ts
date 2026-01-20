"use node"

import { Infer, v } from "convex/values";
import { ActionCtx, authAction } from "../../../procedures"
import { compressImageAuto, hasImageAlpha, imageBufferFromUrl } from "@/lib/image/node";
import { StorageCloud } from "@/lib/s3/node";
import { createHash } from "node:crypto";
import { Id } from "../../../_generated/dataModel";
import { internal } from "../../../_generated/api";
import { IMAGE_TAGS } from "../../../schema/images";
import { SavedImage } from "../../../functions/images";
import { uploadSingleArgs } from "./uploadOne";
import { internalAction } from "../../../_generated/server";
import { retryPromise } from "@shared/utils";

type Extra = {
  userId: Id<'users'>,
  tags?: Infer<typeof IMAGE_TAGS>,
  object?: {
    baseImageId: Id<'images'>,
    x: number,
    y: number,
  }
}

const uploadImage = async (ctx: ActionCtx, base64orUrl: string, extra: Extra) => {
  const buffer = await imageBufferFromUrl(base64orUrl);

  const hasAlpha = await hasImageAlpha(buffer);
  const compressedImage = await compressImageAuto(buffer);

  const base64Data = compressedImage.buffer.toString('base64');
  const hashBase64 = createHash('sha256').update(base64Data).digest('hex');

  const userId = extra.userId;

  // UPLOAD FILE
  const folder = StorageCloud.FOLDERS.USER(userId)
  const uploadedFile = await StorageCloud.uploadFile(compressedImage, folder);

  const image = {
    userId,
    hashBase64,
    url: uploadedFile.location,
    key: uploadedFile.key,
    width: compressedImage.width,
    height: compressedImage.height,
    size: compressedImage.size,
    mimeType: compressedImage.mimeType,
    hasAlpha: hasAlpha ?? false, // TODO: check if the image has alpha
    object: extra.object,
    tags: extra.tags,
  }

  return image;
}

const imagesArgs = v.array(v.object(uploadSingleArgs));

type SharedArgs = {
  images: Infer<typeof imagesArgs>,
  userId: Id<'users'>,
}

export const uploadManySharedHandler = async (ctx: ActionCtx, args: SharedArgs): Promise<Array<SavedImage>> => {
  const preparedImages = await Promise.all(args.images.map(async (image) => {
    const url = image.url ?? image.base64;
    if (!url) throw new Error("Either url or base64 image data must be provided");
    return uploadImage(ctx, url, {
      object: image.object,
      userId: args.userId,
      tags: image.tags,
    });
  }));

  const images = await retryPromise(() => ctx.runMutation(internal.router.storage.images.saveMany._internal, {
    userId: args.userId,
    images: preparedImages.map((image) => ({
      url: image.url,
      key: image.key,
      hashBase64: image.hashBase64,
      width: image.width,
      height: image.height,
      size: image.size,
      mimeType: image.mimeType,
      hasAlpha: image.hasAlpha,
      tags: image.tags,
      object: image.object,
    })),
  }));

  ctx.scheduler.runAfter(0, internal.router.storage.images.uploadSizes._internal, {
    imageIds: images.map((img) => img._id),
  });

  return images;
}

export const authed = authAction({
  args: { images: v.array(v.object(uploadSingleArgs)) },
  handler: async (ctx, args): Promise<Array<SavedImage>> =>
    uploadManySharedHandler(ctx, { ...args, userId: ctx.userId })
});

export const _internal = internalAction({
  args: { images: v.array(v.object(uploadSingleArgs)), userId: v.id('users') },
  handler: uploadManySharedHandler
});