type Options = {
  x: number;
  y: number;
  color?: string;
  inverted?: boolean;
};

export const createMask = async (
  baseImageUrl: string,
  maskImageUrl: string,
  options: Options
): Promise<string> => {
  const { x, y, inverted } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Enable image smoothing to improve quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Ensure CORS compatibility for external images
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };

  // Load both images
  const [baseImage, maskImage] = await Promise.all([
    loadImage(baseImageUrl),
    loadImage(maskImageUrl),
  ]);

  // Set canvas size to match the base image
  canvas.width = baseImage.width;
  canvas.height = baseImage.height;

  ctx.fillStyle = options.color ?? 'black'; // Subject color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (inverted) {
    // Inverted: Subject is black, background is transparent
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    // Normal: Subject is transparent, background is black
    ctx.globalCompositeOperation = 'destination-in'; // Keep the subject and remove the rest
  }

  ctx.drawImage(maskImage, x, y);

  // Reset composite operation to default
  ctx.globalCompositeOperation = 'source-over';

  // Convert the canvas to an image
  return canvas.toDataURL('image/webp', 1);
};
