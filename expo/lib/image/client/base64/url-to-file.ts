import { Paths, File as SystemFile } from "expo-file-system";
import { Platform, Image as ReactNativeImage } from "react-native";
import { getImageDimensions } from '../metadata';

const randomId = () => Math.random().toString(36).slice(2, 12);

function getExtensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    case 'video/mp4':
      return 'mp4';
    case 'video/quicktime':
      return 'mov';
    case 'application/pdf':
      return 'pdf';
    case 'text/plain':
      return 'txt';
    default:
      return '';
  }
}

function getMimeType(uri: string) {
  const extension = uri.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'pdf':
      return 'application/pdf';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

async function uriToImageWeb(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  const file = new File([blob], url.split('/').pop() ?? randomId(), { type: blob.type });

  const dimensions = await new Promise<{ width: number, height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (e) => reject(e);
    img.src = url;
  });

  return {
    uri: url,
    name: file.name,
    type: file.type,
    size: file.size,
    format: getExtensionFromMimeType(file.type),
    width: dimensions.width,
    height: dimensions.height,
    toBase64: async () => {
      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    },
    toBlob: async () => blob,
  }
}

/**
 * Converts a local URI to a "File-like" object
 * @param {string} uri - local file URI (from ImagePicker, DocumentPicker, etc.)
 * @returns {Promise<object>} File-like object
 */
async function uriToImage(uri: string) {
  try {
    // 1️⃣ Get file info
    const _file = new SystemFile(uri);

    if (!_file) { throw new Error('File instance is null or undefined'); }

    const fileInfo = _file.info();
    if (!fileInfo.exists) throw new Error('File does not exist');

    // 2️⃣ Get file name
    const name = uri.split('/').pop() ?? randomId();

    // 3️⃣ Detect MIME type
    let type = getMimeType(uri) || 'application/octet-stream';

    // 4️⃣ For images, get dimensions
    const { width, height } = await getImageDimensions(uri);

    if (!fileInfo.size) throw new Error('Could not determine file size');

    // 5️⃣ Build the File-like object
    const file = {
      uri,
      name,
      type,
      size: fileInfo.size,
      format: getExtensionFromMimeType(type),
      width,
      height,
      toBase64: async () => {
        const fileInstance = new SystemFile(uri);
        if (!fileInstance || typeof fileInstance.base64 !== 'function') {
          throw new Error('File.base64 is not available');
        }
        const base64 = await fileInstance.base64();
        const base64WithHeader = `data:${type};base64,${base64}`;
        return base64WithHeader;
      },
      // Optional: convert to Blob if needed
      toBlob: async () => {
        const base64 = await (new SystemFile(uri)).base64();
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        return new Blob([byteArray], { type });
      },
    };

    return file;
  } catch (error) {
    throw error;
  }
}

export const urlToImage = async (url: string | number) => {
  if (typeof url === 'number') {
    const uri = ReactNativeImage.resolveAssetSource(url).uri;
    return await uriToImage(uri);
  }

  // Check if URL is external (http/https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Download to cache directory with unique filename
    const downloadedFile = await SystemFile.downloadFileAsync(url, Paths.cache, { idempotent: true });
    const file = await uriToImage(downloadedFile.uri);
    return file;
  }

  if (Platform.OS === 'web')
    return await uriToImageWeb(url);

  // Check if URL is a iOS Photos framework URI (ph://)
  if (url.startsWith('ph://')) {
    // Convert ph:// URI to local file URI using expo-media-library
    const { getAssetInfoAsync } = await import('expo-media-library');
    // Extract the asset ID from the ph:// URI (remove ph:// prefix and any /L0/001 suffix)
    const assetId = url.replace('ph://', '').split('/')[0];
    const assetInfo = await getAssetInfoAsync(assetId);
    if (!assetInfo?.localUri) throw new Error('Could not get local URI for ph:// asset');
    return await uriToImage(assetInfo.localUri);
  }

  return await uriToImage(url);
}