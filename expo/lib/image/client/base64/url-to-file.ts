import { File, Paths } from "expo-file-system";
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

/**
 * Converts a local URI to a "File-like" object
 * @param {string} uri - local file URI (from ImagePicker, DocumentPicker, etc.)
 * @returns {Promise<object>} File-like object
 */
async function uriToImage(uri: string) {
  try {
    // 1️⃣ Get file info
    const _file = new File(uri);

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
        const fileInstance = new File(uri);
        if (!fileInstance || typeof fileInstance.base64 !== 'function') {
          throw new Error('File.base64 is not available');
        }
        const base64 = await fileInstance.base64();
        const base64WithHeader = `data:${type};base64,${base64}`;
        return base64WithHeader;
      },
      // Optional: convert to Blob if needed
      toBlob: async () => {
        const base64 = await (new File(uri)).base64();
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        return new Blob([byteArray], { type });
      },
    };

    return file;
  } catch (error) {
    throw error;
  }
}

export const urlToImage = async (url: string) => {
  // Check if URL is external (http/https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Download to cache directory with unique filename
    const downloadedFile = await File.downloadFileAsync(url, Paths.cache, { idempotent: true });
    const file = await uriToImage(downloadedFile.uri);
    return file;
  }

  return await uriToImage(url);
}