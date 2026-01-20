/**
 * Converts a HEIC/HEIF File to a JPEG File for browser compatibility.
 * If the file is not a HEIC image, returns it unchanged.
 * This should be called at file upload entry points.
 * 
 * @param file - The file to convert
 * @returns Promise resolving to a browser-compatible File
 */
export async function convertHeicFile(file: File): Promise<File> {
  // Check if this is a HEIC/HEIF file
  const isHeic = file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name);

  if (!isHeic) {
    return file;
  }

  try {
    // Read file as ArrayBuffer and convert to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Convert HEIC to JPEG using browser's native encoder
    const convert = (await import('heic-convert/browser')).default;
    const outputBuffer = await convert({
      buffer: buffer as unknown as ArrayBuffer,
      format: 'JPEG',
      quality: 1,
    });

    // Create a new File from the converted buffer
    const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    return new File([outputBuffer], newFileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('Failed to convert HEIC file:', error);
    throw new Error(`HEIC conversion failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Converts HEIC/HEIF images to JPEG format for browser compatibility.
 * If the source is not a HEIC image, returns it unchanged.
 * 
 * @param src - The image source (URL, data URL, or Blob URL)
 * @returns Promise resolving to a browser-compatible image source
 */
export async function ensureBrowserCompatibleImage(src: string): Promise<string> {
  // Check if this is a HEIC/HEIF image
  const isHeic = /\.(heic|heif)$/i.test(src) ||
    src.includes('image/heic') ||
    src.includes('image/heif');

  if (!isHeic) {
    return src;
  }

  try {
    // Fetch the image
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Convert HEIC to JPEG using browser's native encoder
    const convert = (await import('heic-convert/browser')).default;
    const outputBuffer = await convert({
      buffer: buffer as unknown as ArrayBuffer,
      format: 'JPEG',
      quality: 1,
    });

    // Create a blob from the output buffer
    const blob = new Blob([outputBuffer], { type: 'image/jpeg' });

    // Create a blob URL for the converted image
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to convert HEIC image:', error);
    throw new Error(`HEIC conversion failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Creates an Image element with HEIC support.
 * Automatically converts HEIC images to browser-compatible format.
 * 
 * @param src - The image source
 * @returns Promise resolving to a loaded HTMLImageElement
 */
export async function createImageWithHeicSupport(src: string): Promise<HTMLImageElement> {
  const compatibleSrc = await ensureBrowserCompatibleImage(src);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // If we created a blob URL for conversion, we should revoke it after loading
      if (compatibleSrc !== src && compatibleSrc.startsWith('blob:')) {
        // Don't revoke immediately - let the caller handle cleanup if needed
      }
      resolve(img);
    };

    img.onerror = (e) => {
      // Clean up blob URL on error
      if (compatibleSrc !== src && compatibleSrc.startsWith('blob:')) {
        URL.revokeObjectURL(compatibleSrc);
      }
      reject(new Error(`Failed to load image: ${e.toString()}`));
    };

    img.src = compatibleSrc;
  });
}
