"use node"
import { env } from "../../env";
import { sanitizeImageForReplicate } from "../replicate/node";

type Parameters = {
  prompt: string;
  images: { url: string, hasAlpha: boolean }[];
  aspectRatio?: '3:4',
  model: "seedream-4-5-251128"
}

export const predictImage = async (params: Parameters) => {
  try {
    const imageUrls = await Promise.all(params.images.map(async (img) => {
      if (!img.hasAlpha) return img.url;
      return (await sanitizeImageForReplicate(img.url)).url;
    }));

    const response = await fetch("https://ark.ap-southeast.bytepluses.com/api/v3/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.BYTEPLUS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: params.model,
        prompt: params.prompt,
        image: imageUrls.map(url => url),
        sequential_image_generation: "disabled",
        watermark: false,
        response_format: "url",
        size: "3520x4704",
      })
    });
    const result = await response.json();

    const imageBase64 = result.data[0].url;
    return imageBase64 as string;
  } catch {
    return undefined;
  }
}
