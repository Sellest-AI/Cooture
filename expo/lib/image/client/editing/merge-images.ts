export const mergeImages = async (...imageUrls: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (imageUrls.length === 0) {
      return reject(new Error("No images provided."));
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return reject(new Error("Failed to get canvas context."));
    }

    let loadedImages = 0;
    const images: HTMLImageElement[] = [];

    imageUrls.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Handle CORS if needed
      img.src = url;

      img.onload = () => {
        images[index] = img;
        loadedImages++;

        if (loadedImages === imageUrls.length) {
          // Set canvas size to match the first image
          canvas.width = images[0]!.width;
          canvas.height = images[0]!.height;

          // Draw each image on the canvas
          images.forEach((image) => {
            ctx.drawImage(image, 0, 0);
          });

          // Resolve with the merged image as a Base64 data URL
          resolve(canvas.toDataURL("image/webp"));
        }
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
  });
};
