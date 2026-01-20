/**
 * @param src the image src
 * @param precision **0 - 100**, 100 requiring more transparent pixels than 0, default 100
 * @returns true if the image is transparent, false otherwise
 */
export const hasImageAlpha = (src: string, precision = 100): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) {
        reject(new Error('Cannot create canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const sampleInterval = 100;

      for (let i = 3; i < data.length; i += 4 * sampleInterval) {
        if ((data[i] ?? 255) < (255 - 30 - precision)) {
          resolve(true);
          return; // Exit early if a transparent pixel is found
        }
      }

      resolve(false); // No transparent pixels found
    };

    img.onerror = function () {
      reject(new Error('Failed to load image'));
    };

    img.src = src;
  });
};
