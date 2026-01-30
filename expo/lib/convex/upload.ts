import { useState } from "react";
import { compressImage } from "../image/client/editing";
import { api, Id, useAction } from "./client";

export const useUpload = () => {
  const { action: uploadImageConvex } = useAction(api.router.storage.images.uploadOne.authed);
  const [isLoading, setLoading] = useState(false);

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      console.time('compressImage');
      const file = await compressImage(uri);
      console.timeEnd('compressImage');
      console.time('toBase64');
      const base64 = await file.toBase64();
      console.timeEnd('toBase64');
      console.time('uploadImageConvex');
      const imageId = await uploadImageConvex({
        base64,
        tags: ['IMAGE'],
      });
      console.timeEnd('uploadImageConvex');

      return imageId;

    } finally {
      setLoading(false);
    }
  }

  const uploadObject = async (uri: string, data: {
    baseImageId: Id<'images'>;
    x: number;
    y: number;
  }) => {
    try {
      setLoading(true);
      const file = await compressImage(uri);
      const base64 = await file.toBase64();
      const objectId = await uploadImageConvex({
        base64,
        tags: ['OBJECT'],
        ...data,
      });
      return objectId;
    } finally {
      setLoading(false);
    }
  }

  return {
    uploadObject,
    uploadImage,
    isLoading,
  }
}