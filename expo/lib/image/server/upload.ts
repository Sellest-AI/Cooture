"use server"
import { compressImageAuto } from "./utils";
import { api, fetchMutationServer, Id } from "../../convex/server";
import { postImagesUpload } from "./post-upload";
import { after } from "next/server";
import { notEmpty } from "@utils/convex-allowed";
import { retryMutation } from "@/lib/convex/utils";
import { createHash } from "crypto";
import { StorageCloud } from "@/lib/s3";

type AdditionalData = {
  hasAlpha?: boolean;
  userId: string;
  object?: {
    baseImageId?: string;
    x: number,
    y: number,
  }
}

/** @deprecated - A copy of the router.storage.images.uploadOne sub function. Use the convex function instead. */
const uploadFileToS3 = async (base64OrUrl: string, data: AdditionalData) => {
  const userId = data.userId;
  const object = data.object;

  if (!userId) return null;

  const [image] = await Promise.all([
    compressImageAuto(base64OrUrl)
  ])

  const hashBase64 = createHash('sha256').update(image.buffer.toString('base64')).digest('hex');

  // UPLOAD FILE
  const folder = StorageCloud.FOLDERS.USER(userId)
  const uploadedFile = await StorageCloud.uploadFile(image, folder);

  return {
    userId: userId as Id<'users'>,
    hashBase64,
    url: uploadedFile.location,
    key: uploadedFile.key,
    width: image.width,
    height: image.height,
    size: image.size,
    mimeType: image.mimeType,
    hasAlpha: data.hasAlpha ?? false, // TODO: check if the image has alpha
    object: object ? {
      baseImageId: object.baseImageId as Id<'images'>,
      x: object.x,
      y: object.y,
    } : undefined,
  }
}

/** @deprecated - Use the convex router.storage.images.uploadOne instead. It will handle the uploadSizes too. */
export const uploadFile = async (base64OrUrl: string, data: AdditionalData) => {
  const result = await uploadFileToS3(base64OrUrl, data);
  if (!result) return null;

  const imagesDB = await retryMutation(() =>
    fetchMutationServer(api.router.storage.images.saveMany.server, {
      userId: result.userId,
      images: [result]
    }))

  after(() => postImagesUpload({ ids: imagesDB.map(img => img._id) }));

  return imagesDB[0];
}


/** @deprecated - Use the convex router.storage.images.uploadMany instead. It will handle the uploadSizes too. */
export const uploadFiles = async (files: Array<AdditionalData & { base64: string }>) => {
  // check that all the userIds are the same
  const userIds = new Set(files.map(res => res?.userId).filter(notEmpty));
  if (userIds.size !== 1) { throw new Error("All images must belong to the same user"); }

  const results = await Promise.all(files.map(file => uploadFileToS3(file.base64, file)));

  const filteredResults = results.filter(notEmpty);
  if (filteredResults.length === 0) return [];

  const imagesDB = await retryMutation(() =>
    fetchMutationServer(api.router.storage.images.saveMany.server, {
      userId: filteredResults[0].userId,
      images: filteredResults
    }))

  after(() => postImagesUpload({ ids: imagesDB.map(img => img._id) }));

  return imagesDB;
}