export function setImageBackground(imageUrl: string, color: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create an image element
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // If the image is hosted on a different origin

    img.onload = function () {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) return reject(new Error('Failed to get 2d context of canvas'));

      // Draw the black background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image on top of the black background
      ctx.drawImage(img, 0, 0);

      // Get the data URL of the modified image
      const dataUrl = canvas.toDataURL('image/png');

      // Resolve the promise with the data URL
      resolve(dataUrl);
    };

    img.onerror = function () {
      // Reject the promise if there's an error loading the image
      reject(new Error('Failed to load the image.'));
    };

    // Set the source of the image
    img.src = imageUrl;
  });
}