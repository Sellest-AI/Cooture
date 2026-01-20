type Response = {
  blob: Blob | null;
  dataUrl: string;
  original: { width: number, height: number }
  cropped: boolean,
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

export function cropImageFromURL(imageURL: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Enable image smoothing to improve quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Set canvas size to the image size
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the image onto the canvas
      ctx.drawImage(image, 0, 0);

      const w = canvas.width;
      const h = canvas.height;
      const pix: { x: Array<number>, y: Array<number> } = { x: [], y: [] };
      const imageData = ctx.getImageData(0, 0, w, h);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const index = (y * w + x) * 4;
          const pixel = imageData.data[index + 3] ?? 0; // Alpha value
          if (pixel) { // Check if pixel is not transparent
            pix.x.push(x);
            pix.y.push(y);
          }
        }
      }

      if (pix.x.length === 0 || pix.y.length === 0) {
        // No visible pixels found
        reject(new Error('No visible pixels found'));
        return;
      }

      pix.x.sort((a, b) => a - b);
      pix.y.sort((a, b) => a - b);
      const n = pix.x.length - 1;

      // Calculate new width and height
      const left = pix.x[0]!;
      const top = pix.y[0]!;
      const newWidth = 1 + pix.x[n]! - left;
      const newHeight = 1 + pix.y[n]! - top;

      // Create a new cropped image data
      const croppedImageData = ctx.getImageData(left, top, newWidth, newHeight);

      // Resize canvas to new dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Put the cropped image data back on the canvas
      ctx.putImageData(croppedImageData, 0, 0);

      const cropped = newWidth !== w || newHeight !== h;

      canvas.toBlob((b) => {
        resolve({
          blob: b,
          dataUrl: canvas.toDataURL('image/webp', 1), // Resolve with the cropped canvas to dataUrl
          position: { left, top, width: newWidth, height: newHeight },
          original: { width: w, height: h },
          cropped
        });
      }, 'image/webp', 1);
    };

    image.onerror = () => {
      reject(new Error('Failed to load image from URL'));
    };

    image.src = imageURL; // Set the image URL as the source of the image
  });
}
