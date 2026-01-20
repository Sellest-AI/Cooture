import sharp from "sharp";

export const imageMetadata = async (image: Buffer) => {
  const metadata = await sharp(image).metadata(); // Get the image's metadata

  const { width, height } = { width: metadata.width ?? 0, height: metadata.height ?? 0 }

  return {
    ...metadata,
    mimeType: `image/${metadata.format}`,
    width,
    height,
    size: image.length,
  }
}