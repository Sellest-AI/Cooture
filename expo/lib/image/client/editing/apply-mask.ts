export async function applyMaskToImage(imageUrl: string, maskUrl: string): Promise<string> {
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Handle cross-origin requests
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const [image, mask] = await Promise.all([loadImage(imageUrl), loadImage(maskUrl)]);

  // Create a canvas and set its size to the image dimensions
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get 2D context");
  }

  // Enable image smoothing to improve quality
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  canvas.width = image.width;
  canvas.height = image.height;

  // Draw the mask first
  context.drawImage(mask, 0, 0, canvas.width, canvas.height);

  // Set the globalCompositeOperation to "source-in"
  context.globalCompositeOperation = "source-out";

  // Draw the main image on top
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Return the result as a data URL
  return canvas.toDataURL('image/webp', 1);
}