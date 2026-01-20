export const isFullyTransparent = async (imageUrl: string) => {
  const img = new Image();
  img.src = imageUrl;
  return new Promise<boolean>((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const data = ctx?.getImageData(0, 0, img.width, img.height).data;
      if (!data) return resolve(true);
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) return resolve(false);
      }
      resolve(true);
    }
  });
}