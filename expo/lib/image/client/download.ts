import { nanoid } from "nanoid";
import { convertImage } from "./editing";
import { base64ToFile } from "./base64";

export const download = async (url: string) => {
  if (url.startsWith('data:')) {
    const file = base64ToFile(url);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      const a = document.createElement('a');
      a.setAttribute('href', reader.result as string);
      a.setAttribute('download', `${nanoid()}.${file.type.split('/')[1]}`);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  } else {
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('_target', 'blank');
    a.setAttribute('download', `${nanoid()}.${extension(url)}`);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

const extension = (url: string) => url.split('.').pop() ?? getExtensionFromBase64(url);

export const getExtensionFromBase64 = (base64: string): string | null => {
  const mimeMatch = /^data:(image\/[a-zA-Z]+);base64,/.exec(base64);
  return mimeMatch?.[1]?.split('/')[1] ?? null;
};

export const downloadImage = async (url: string, preferedFormat: 'original' | 'png' = 'original') => {
  try {
    const a = document.createElement('a');

    if (preferedFormat === "original") {
      await download(url);
      return;
    }

    const convertedFileUrl = await convertImage(url, 'png');
    const file = base64ToFile(convertedFileUrl);

    // file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      a.setAttribute('href', reader.result as string);
      a.setAttribute('download', `${nanoid()}.png`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  } catch { downloadImage(url, 'original').catch(() => null) }
}