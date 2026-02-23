import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { urlToImage } from '../base64/url-to-file';

const convertUrl = async (url: string) => {
  // Local URI - process directly
  const file = await urlToImage(url);
  return file;
}

type File = Awaited<ReturnType<typeof urlToImage>>;

type Options = {
  progress?: (progress: number) => void,
  initialQuality?: number,
  maxResolution?: number,
  keepMimeType?: boolean,
}

type Level = {
  resolution: number;
  targetSizeKb: number;
  initialQuality: number;
  compressionStrength: {
    sizeKb: number;
    initialQuality: number;
  }[]
}

type Compression = Omit<Level, 'compressionStrength'>;

const compression8k: Level = {
  resolution: 8 * 1024,
  // targetSizeKb: 4 * 1024, // PREFERED
  targetSizeKb: 3 * 1024, // CONVEX ONLY ALLOWS 5MB FILES (3MB * 1.33 SAFETY BASE64 MARGIN)
  initialQuality: 60,
  compressionStrength: [
    { sizeKb: 20 * 1024, initialQuality: 40 }
  ]
}

const compression4k: Level = {
  resolution: 4 * 1024,
  targetSizeKb: Math.round(1.8 * 1024),
  initialQuality: 90,
  compressionStrength: [
    { sizeKb: 20 * 1024, initialQuality: 60 },
    { sizeKb: 10 * 1024, initialQuality: 75 },
    { sizeKb: 2 * 1024, initialQuality: 87 },
  ]
}

const compression2k: Level = {
  resolution: 2 * 1024,
  targetSizeKb: 500,
  initialQuality: 92,
  compressionStrength: [
    { sizeKb: 8 * 1024, initialQuality: 70 },
    { sizeKb: 4 * 1024, initialQuality: 76 },
    { sizeKb: 2 * 1024, initialQuality: 81 },
    { sizeKb: 1 * 1024, initialQuality: 86 },
  ]
}

const compression1k: Level = {
  resolution: 1024,
  targetSizeKb: 200,
  initialQuality: 98,
  compressionStrength: [
    { sizeKb: 4 * 1024, initialQuality: 92 },
    { sizeKb: 1 * 1024, initialQuality: 95 },
  ]
}

const compressions: Level[] = [
  compression8k,
  compression4k,
  compression2k,
  compression1k
];

const getCompression = (resolution: number, sizeKb: number): Compression => {
  // Tolerance percentage for matching resolutions
  const TREHSOLD_POURCENT = 0.2;

  // Sort compressions by resolution in descending order
  const sortedCompressions = compressions.sort((a, b) => b.resolution - a.resolution);

  // Find the compression level where the resolution is within the threshold percentage
  const compressionIndex = sortedCompressions.findIndex(
    (c) => resolution >= c.resolution * (1 - TREHSOLD_POURCENT)
  );
  const compression = sortedCompressions[compressionIndex];

  // If no suitable compression is found (image resolution is very small)
  if (!compression) {
    // Use the smallest compression level
    const compression = sortedCompressions[sortedCompressions.length - 1]!;
    const minKb = 10; // Minimum target size in KB
    const maxKb = compression.targetSizeKb;

    // Scale the target size based on the ratio of the current resolution to the compression's resolution
    const targetSizeKb = Math.max(minKb, (maxKb * resolution) / compression.resolution);
    return {
      ...compression,
      resolution,
      targetSizeKb,
    };
  }

  // Sort the compression strengths by size (descending)
  const sortedStrengths = compression.compressionStrength.sort((a, b) => b.sizeKb - a.sizeKb);

  // Find the compression strength level based on the size of the image
  const strengthIndex = sortedStrengths.findIndex((s) => sizeKb >= s.sizeKb);

  // If no suitable strength is found, use the default compression's initial quality
  if (strengthIndex === -1) {
    return { ...compression, initialQuality: compression.initialQuality };
  }

  // Use the matched compression strength
  const strength = sortedStrengths[strengthIndex]!;

  // If it's the strongest compression strength, use its initial quality directly
  if (strengthIndex === 0) {
    return { ...compression, initialQuality: strength.initialQuality };
  }

  // Lerp the initial quality between the current strength and the previous one
  const previousStrength = sortedStrengths[strengthIndex - 1]!;
  const factor = (sizeKb - strength.sizeKb) / (previousStrength.sizeKb - strength.sizeKb);

  // Calculate interpolated initial quality based on size difference
  const initialQuality =
    strength.initialQuality +
    (previousStrength.initialQuality - strength.initialQuality) * factor;

  // If the resolution matches perfectly or it's the highest compression level, return the result
  const isPerfectResolution = resolution === compression.resolution;
  if (compressionIndex === 0 || isPerfectResolution) {
    return { ...compression, initialQuality };
  }

  // Scale the target size for the current resolution
  const nextLevelCompression = compressions[compressionIndex - 1]!;
  const minKb = compression.targetSizeKb;
  const maxKb = nextLevelCompression.targetSizeKb;

  // Scale the target size based on the ratio of the current resolution to the next level's resolution
  const targetSizeKb = Math.max(minKb, (maxKb * resolution) / nextLevelCompression.resolution);

  return {
    ...compression,
    targetSizeKb,
    initialQuality,
  };
};

/**
 * Core compression logic using Expo Image Manipulator
 * Iterates quality reduction until target size is met or max iterations reached.
 */
const compress = async (
  file: File,
  options: {
    maxIteration: number;
    initialQuality: number;
    maxSizeMB: number;
    fileType?: 'image/webp' | 'image/jpeg' | 'image/png';
    alwaysKeepResolution: boolean;
    maxWidthOrHeight?: number;
    preserveExif: boolean;
    onProgress?: (progress: number) => void;
  }
): Promise<File> => {
  const { maxIteration, maxSizeMB, initialQuality, fileType, maxWidthOrHeight, onProgress } = options;
  const targetSizeBytes = maxSizeMB * 1024 * 1024;

  // Convert File to URI for Expo Image Manipulator
  const imageUri = file.uri;
  let currentQuality = initialQuality;
  let lastResult: File = file;

  // Map mime types to Expo SaveFormat
  const format = fileType === 'image/png' ? SaveFormat.PNG :
    fileType === 'image/webp' ? SaveFormat.WEBP :
      SaveFormat.JPEG;

  try {
    for (let i = 0; i < maxIteration; i++) {
      const resize = maxWidthOrHeight ? {
        width: file.width > file.height ? maxWidthOrHeight : undefined,
        height: file.height >= file.width ? maxWidthOrHeight : undefined
      } : undefined;

      let manipulator = ImageManipulator.manipulate(imageUri);
      if (resize && (resize.width || resize.height)) {
        manipulator = manipulator.resize(resize);
      }

      const result = await (await manipulator
        .renderAsync())
        .saveAsync({
          format: format,
          base64: false,
          compress: Math.max(0, Math.min(1, currentQuality)),
        });

      const compressedFile = await convertUrl(result.uri);
      lastResult = compressedFile;

      if (onProgress) onProgress((i + 1) / maxIteration);

      // Check if we hit the target
      if (compressedFile.size <= targetSizeBytes) {
        break;
      }

      // Reduce quality for next iteration (aggressive decay)
      // If size is still 1.8x target, drop quality faster
      const overageRatio = compressedFile.size / targetSizeBytes;
      currentQuality -= overageRatio > 1.8 ? 0.15 : 0.08;

      if (currentQuality <= 0.05) break; // Diminishing returns
    }
  } catch (error) {
    if (Platform.OS === 'web') URL.revokeObjectURL(imageUri);
    console.error('Image compression failed:', error);
    throw error;
  }

  return lastResult;
};

export const compressImage = async (url: string, options?: Options): Promise<File> => {
  const file = await convertUrl(url);

  const forceCompression = !['image/webp', 'image/png', 'image/jpeg'].includes(file.type);

  const dimensions = { width: file.width, height: file.height };
  const dimension = Math.max(dimensions.width, dimensions.height);
  const targetDimension = Math.min(options?.maxResolution ?? Infinity, dimension);

  const sizeKb = Math.round(file.size / 1024);

  const compression = getCompression(targetDimension, sizeKb);

  // if image is not webp, png, or jpeg, force compression
  if (!forceCompression) {
    // If no compression is needed, return the original file
    if (compression.targetSizeKb >= sizeKb) return file;
  }

  // Override the runtime quality if it's smaller
  const baseQuality = Math.min((options?.initialQuality ?? Infinity), compression.initialQuality);
  // we divide by 98 not 100, because the compression algorithm decay the quality
  // more rapidly than the native browser canvas compression
  // 97% quality is almost equivalent to 92% quality in the browser
  // ↗️↗️ DEPRECATED
  const initialQuality = baseQuality / 100; // Expo uses [0, 1] range

  // Determine if resolution needs to be reduced
  const shouldReduceResolution = dimension > compression.resolution;

  const compressedFile = await compress(file, {
    maxIteration: 5,
    initialQuality: Math.min(1, initialQuality),
    maxSizeMB: compression.targetSizeKb / 1024,
    fileType: options?.keepMimeType ? undefined : 'image/webp',
    alwaysKeepResolution: !shouldReduceResolution,
    maxWidthOrHeight: shouldReduceResolution ? compression.resolution : undefined,
    preserveExif: true,
    onProgress: options?.progress,
  })

  if (!forceCompression) {
    // if the compressed file is less than 10% smaller than the original file
    // we return the original file
    if (compressedFile.size > 0.9 * file.size) return file;
  }

  return compressedFile;
}
