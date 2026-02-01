import { File } from 'expo-file-system';
import { nanoid } from 'nanoid';
import { getImageDimensions } from '../metadata';

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
export async function uriToImage(uri: string) {
  // 1️⃣ Get file info
  const _file = new File(uri);
  const fileInfo = _file.info();
  if (!fileInfo.exists) throw new Error('File does not exist');

  // 2️⃣ Get file name
  const name = uri.split('/').pop() ?? nanoid();

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
    // Optional: convert to Blob if needed
    toBase64: async () => {
      const base64 = await (new File(uri)).base64();
      return base64;
    },
    toBlob: async () => {
      const base64 = await (new File(uri)).base64();
      const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      return new Blob([byteArray], { type });
    },
  };

  return file;
}
