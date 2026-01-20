import { isBase64 } from "./is-base64";

const getMimeTypeFromUrl = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0];
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return undefined;
  }
};

export const urlToBase64 = async (url: string): Promise<string> => {
  if (isBase64(url)) return url;

  const result = await fetch(url);
  const blob = await result.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result?.toString().split(',')[1]; // get just the base64 part
      const mimeType = getMimeTypeFromUrl(url) || blob.type;
      resolve(`data:${mimeType};base64,${base64data}`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
