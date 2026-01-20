export const flipImage = (imageUrl: string, flipX: boolean, flipY: boolean) => {
  if (!flipX && !flipY) return Promise.resolve(imageUrl);
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Failed to get canvas context"));
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      ctx.drawImage(img, flipX ? -img.width : 0, flipY ? -img.height : 0, img.width, img.height);
      resolve(canvas.toDataURL());
    };
    img.onerror = () => reject(new Error("Failed to load image"));
  });
}