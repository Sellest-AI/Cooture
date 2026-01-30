type Options = {
  quality?: number;
  resize?: number;
}

type Format = 'png' | 'webp'
export function convertImage(url: string, format: Format, options?: Options): Promise<string> {
  const _options = { quality: 100, ...options };
  const quality = _options.quality;
  const targetWidth = _options.resize;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // To handle cross-origin images
    img.src = url;

    img.onload = () => {
      let finalWidth = img.width;
      let finalHeight = img.height;

      // Handle resizing if a target width is provided
      if (targetWidth) {
        // Maintain aspect ratio while resizing
        if (targetWidth < img.width) {
          const aspectRatio = img.height / img.width;
          finalWidth = targetWidth;
          finalHeight = Math.round(targetWidth * aspectRatio);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'));
      }

      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType, quality > 1 ? quality / 100 : quality);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
  });
}
