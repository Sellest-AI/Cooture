import { base64ToFile, urlToBase64 } from "../base64";
import { getFileDimensions } from "../metadata";

export const downscaleImage = async (url: string, biggetSize: number): Promise<string> => {
  const file = base64ToFile(await urlToBase64(url));
  const { width, height } = await getFileDimensions(file);

  if (width <= biggetSize && height <= biggetSize) {
    return typeof url === 'string' ? url : URL.createObjectURL(file);
  }

  const scale = Math.max(width, height) / biggetSize;
  const newWidth = Math.round(width / scale);
  const newHeight = Math.round(height / scale);

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = typeof url === 'string' ? url : URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => { reject(new Error('Failed to load image')); };
  });

  try {
    return canvas.toDataURL(file.type || 'image/webp', 1);
  } catch (error) {
    console.error('Error converting canvas to data URL:', error);
    // If we can't process it due to CORS, return the original URL
    return url;
  }
}