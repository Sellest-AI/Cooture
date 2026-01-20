import sharp from "sharp";
import { imageBufferFromUrl } from "./image.buffer";

export const convertImage = async (image: Buffer | string, type: 'png' | 'webp') => {
  const buffer = typeof image === 'string' ? await imageBufferFromUrl(image) : image;

  const [baseMetadata, stats] = await Promise.all([
    sharp(buffer).metadata(), // Get the image's metadata
    sharp(buffer).stats()
  ]);

  const threshold = 255 - 130; // Define threshold for transparency
  const hasAlpha = (stats.channels[3]?.min ?? 255) < threshold; // Alpha is channel 3 (0-based: R=0, G=1, B=2, A=3)

  if (baseMetadata.format === type) return { metadata: baseMetadata, buffer, mimeType: `image/${type}`, hasAlpha }

  const transformer = sharp(buffer);

  if (type === 'webp') { transformer.webp(); }
  else { transformer.png(); }

  const newBuffer = await transformer.toBuffer();

  const metadata = await sharp(buffer).metadata(); // Get the image's metadata

  return {
    metadata,
    buffer: newBuffer,
    mimeType: `image/${type}`,
    hasAlpha
  }
}