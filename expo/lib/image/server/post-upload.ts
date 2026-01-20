"use server"
import { compressImage } from "./utils";
import { StorageCloud } from "../../s3";
import { api, fetchMutationServer, fetchQuery, Id } from "@/lib/convex/server";
import { retryMutation } from "@/lib/convex/utils";

/** @deprecated - A copy of the router.storage.images.uploadSizes sub function. Use the convex function instead. */
const postImageUploadToS3 = async ({ id }: { id: Id<'images'> }) => {
  const image = await fetchQuery(api.router.storage.images.getOne.anon, { id });
  if (!image) return [];

  await StorageCloud.updateCacheControl(image.key);

  type Size = { px: number, quality: number };
  const sizes: Array<Size> = [
    { px: 150, quality: 40 },
    { px: 336, quality: 40 },
    { px: 600, quality: 50 }
  ];

  type Data = typeof api.router.storage.images.saveSizes.server._args;
  const data: Array<Data['images'][number]['sizes'][number]> = [];

  for (const size of sizes) {
    const { px, quality } = size;
    const alreadyExist = image._sizes.find((s) => Math.max(s.width, s.height) === px && s.quality === quality);
    if (alreadyExist) continue;

    const buffer = await compressImage(image.url, { maxSideSize: px, quality: quality })

    const directory = StorageCloud.FOLDERS.getFromKey(image.key);
    const file = await StorageCloud.uploadFile(buffer, directory);

    data.push({
      key: file.key,
      quality: quality,
      size: buffer.metadata.size ?? file.Size ?? image.width,
      width: buffer.metadata.width ?? image.width,
      height: buffer.metadata.height ?? image.height,
      url: file.location,
    })
  }

  return data;
}

/** @deprecated - Use the convex router.storage.images.uploadSizes instead. */
export const postImagesUpload = async ({ ids }: { ids: Id<'images'>[] }) => {
  const results = await Promise.all(ids.map(async (id) => {
    const sizes = await postImageUploadToS3({ id });
    return {
      imageId: id,
      sizes: sizes
    }
  }));

  await retryMutation(() =>
    fetchMutationServer(api.router.storage.images.saveSizes.server, { images: results })
  );

  return true;
}