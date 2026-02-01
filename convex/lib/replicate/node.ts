"use node"
import { addBase64Header, addImageBackground, bufferToBase64, compressImageAuto, convertImage } from "@/lib/image/node";
import { getClosestAspectRatio } from "@shared/utils";
import Replicate from "replicate";
import { env } from "../../env";

/** 
 * Sanitize image for Replicate by ensuring it meets aspect ratio requirements. 
 * If the image's aspect ratio is outside Replicate's accepted range (0.33 to 3.00),
 * add a white background to adjust it within acceptable limits.
 * @param imageUrl - The URL of the image to sanitize.
 * @param fallbackAspectRatio - Optional aspect ratio to use if image dimensions are unavailable.
 * @returns A base64-encoded string or the original imageUrl of the sanitized image with appropriate headers.
*/
export const sanitizeImageForReplicate = async (imageUrl: string) => {
  // retrieve aspect ratio from productImage
  const _png = await convertImage(imageUrl, 'png');
  const dimensions = _png.metadata;
  const size = _png.metadata.size;
  const hasAlpha = _png.hasAlpha;

  let buffer = _png.buffer;
  let aspectRatio: `${number}:${number}` = '1:1';
  let updatedAspectRatio = true;

  if (dimensions.width && dimensions.height) {
    const ratio = dimensions.width / dimensions.height;
    // Replicate requires aspect ratio to be between 0.33 and 3.00 (exclusive)
    // Use safer values: 0.34-2.99 to avoid boundary issues
    if (ratio <= 0.34)
      aspectRatio = "1:2.9"; // ~0.345
    else if (ratio >= 2.99)
      aspectRatio = "2.9:1"; // ~2.9
    else {
      aspectRatio = getClosestAspectRatio(dimensions.width, dimensions.height).closest;
      updatedAspectRatio = false;
    }
  }

  // If aspect ratio is acceptable and no alpha channel
  if (!updatedAspectRatio && !hasAlpha) {
    // If size is available and under 7MB, return original URL
    if (size && size < 7 * 1024 * 1024) {
      return {
        url: imageUrl,
        aspectRatio,
        dimensions: {
          width: dimensions.width!,
          height: dimensions.height!,
        }
      }
    }
  }

  if (hasAlpha || updatedAspectRatio)
    buffer = await addImageBackground(buffer, 'white', { customAspectRatio: aspectRatio, returnFormat: 'png' });

  const png = await compressImageAuto(buffer, { format: 'png', maxSizeKb: 7 * 1024 });
  const base64 = addBase64Header(bufferToBase64(png.buffer), 'png');

  return {
    url: base64,
    aspectRatio: aspectRatio,
    dimensions: {
      width: png.metadata.width!,
      height: png.metadata.height!,
    }
  }
}

export * from "./utils";

export const replicate = new Replicate({
  auth: env.REPLICATE_API_KEY
})

type ImageModel = "bytedance/seedream-4" | "bytedance/seedream-4.5"

type PredictImageParams = {
  images: { url: string, hasAlpha: boolean }[];
  prompt: string;
  aspectRatio?: '3:4',
  model: ImageModel
}

export const predictImage = async (params: PredictImageParams) => {
  const { prompt, aspectRatio } = params;

  const imageUrls = await Promise.all(params.images.map((img) => {
    if (!img.hasAlpha) return img.url;
    return sanitizeImageForReplicate(img.url);
  }));

  const prediction = await replicate.predictions.create({
    model: params.model,
    input: {
      prompt,
      image_input: imageUrls,
      max_images: 1,
      aspect_ratio: aspectRatio,
      size: '4K',
      enhance_prompt: true,
      sequential_image_generation: "disabled"
    },
    webhook: env.CONVEX_SITE_URL + '/api/replicate/webhook',
    webhook_events_filter: ['completed']
  });

  return prediction;
}

