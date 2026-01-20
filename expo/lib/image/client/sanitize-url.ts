import { addBase64Header } from "./base64";

type Options = {
  ext: 'webp' | 'png'
}
export const sanitizeImageUrl = (url: string, options?: Options) => {
  if (url.startsWith('/')) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:image/')) return url;
  return addBase64Header(url, options?.ext ?? 'png');
}