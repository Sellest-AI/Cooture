export const DEFAULT_RESOLUTIONS = ['480p', '720p', '1080p'] satisfies Array<`${string}p`>;

export const aspectRatiosDimensions = {
  ["9:21"]: { width: 640, height: 1536 },
  ["9:16"]: { width: 768, height: 1344 },
  ["2:3"]: { width: 832, height: 1216 },
  ["3:4"]: { width: 896, height: 1152 },
  ["1:1"]: { width: 1024, height: 1024 },
  ["4:3"]: { width: 1152, height: 896 },
  ["3:2"]: { width: 1216, height: 832 },
  ["16:9"]: { width: 1344, height: 768 },
  ["21:9"]: { width: 1536, height: 640 },
} as const;

type Dimensions = {
  width: number;
  height: number;
}

export type AspectRatio = keyof typeof aspectRatiosDimensions;

const commonRatios = [
  { ratio: 16 / 9, label: "16:9" },
  { ratio: 4 / 3, label: "4:3" },
  { ratio: 3 / 2, label: "3:2" },
  // { ratio: 5 / 4, label: "5:4" },
  { ratio: 1, label: "1:1" },
  { ratio: 21 / 9, label: "21:9" },
  // { ratio: 18 / 9, label: "18:9" },
  // { ratio: 32 / 9, label: "32:9" }
] as const satisfies Array<{ ratio: number; label: AspectRatio }>;

type RatioType = 'landscape' | 'portrait';

export function getClosestAspectRatio<T extends AspectRatio>(width: number, height: number, allowed?: T[]): { actual: string, closest: T, type: RatioType } {
  const actualRatio = width / height;
  const isPortrait = actualRatio < 1;

  const allowedRatios = allowed ? commonRatios.filter(r => allowed.includes(r.label as T)) : commonRatios;

  let closest = allowedRatios[0] as typeof commonRatios[number];
  let minDiff = Infinity;

  for (const ratio of allowedRatios) {
    // For portrait, compare against the inverse ratio
    const compareRatio = isPortrait ? 1 / ratio.ratio : ratio.ratio;
    const diff = Math.abs(actualRatio - compareRatio);
    if (diff < minDiff) { minDiff = diff; closest = ratio; }
  }

  // Return the label in the correct orientation
  const [w, h] = closest.label.split(':').map(Number);
  const finalLabel = isPortrait ? `${h}:${w}` : closest.label;

  const type = isPortrait ? 'portrait' : 'landscape';

  return {
    type: type,
    actual: actualRatio.toFixed(4),
    closest: finalLabel as T
  };
}

export const dimensionsToResolution = (dimensions: Dimensions, resolution: number) => {
  const { width, height } = dimensions;

  const { closest } = getClosestAspectRatio(width, height);

  // Extract the numerical ratio from the closest aspect ratio label
  const [w, h] = closest.split(':').map(Number);
  const standardizedRatio = w / h;

  // Calculate total pixels based on 16:9 reference (same as getClosestResolution)
  const referencePixels = resolution * (16 / 9) * resolution;

  // Calculate dimensions based on the standardized aspect ratio
  // Use the same approach: width = sqrt(pixels * ratio), height = sqrt(pixels / ratio)
  const newWidth = Math.sqrt(referencePixels * standardizedRatio);
  const newHeight = Math.sqrt(referencePixels / standardizedRatio);

  return {
    aspectRatio: closest,
    height: Math.round(newHeight),
    width: Math.round(newWidth),
  };
}

type Resolution<T extends `${string}p`> = T;
export const getClosestResolution = <T extends `${string}p`>(dimensions: Dimensions, resolutions: Array<Resolution<T>>): Resolution<T> => {
  const resolutionsInPx = resolutions.map(res => parseInt(res.replace('p', '')));
  const targetPixels = dimensions.width * dimensions.height;

  const closestResolution = resolutionsInPx.reduce((prev, curr) => {
    // Calculate reference pixels for each resolution using 16:9 ratio
    const prevReferencePixels = prev * (16 / 9) * prev;
    const currReferencePixels = curr * (16 / 9) * curr;

    return (Math.abs(currReferencePixels - targetPixels) < Math.abs(prevReferencePixels - targetPixels) ? curr : prev);
  });

  return `${closestResolution}p` as T;
}