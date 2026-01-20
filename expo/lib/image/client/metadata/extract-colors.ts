import { extractColors as extract_colors } from "extract-colors";
import chroma from 'chroma-js';

// Define a function to calculate the distance of a color from the grey scale
export function distanceFromGrey(color: string) {
  const lab = chroma(color).lab();
  return Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
}

// Get luminance of a color
export function getLuminance(color: string) {
  const rgb = chroma(color).rgb();
  return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}

export const areAboutEqual = (color1: string, color2: string, threshold = 0.1) => {
  const lab1 = chroma(color1).lab();
  const lab2 = chroma(color2).lab();
  const deltaE = Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
  return deltaE < threshold;
}

const extract = (src: string, options = { distance: 0.22 }) => {
  return extract_colors(src, {
    crossOrigin: 'anonymous',
    pixels: 64000,
    distance: options.distance,
    colorValidator: (red, green, blue, alpha = 255) => alpha > 250,
    saturationDistance: 0.2,
    lightnessDistance: 0.2,
    hueDistance: 0.083,
  }).then((palette) => {
    return palette
      .filter((c) => c.area > 0.0004)
      .map((c) => ({
        hex: c.hex,
        area: Math.round(c.area * 100 * 100) / 100,
        distance: options.distance
      }));
  });
};

export const extractColors = async (src: string, minAmount: number) => {
  const iterations = 2;
  let extractedColors = await extract(src, { distance: 0.22 });

  const filteredColors = () => {
    // Keep track of which colors we've already seen similar versions of
    const processedIndices = new Set<number>();

    return extractedColors
      .map((color, i) => ({ color, i }))
      .sort((a, b) => {
        // Sort by distance first, then by area
        if (a.color.distance !== b.color.distance) { return b.color.distance - a.color.distance; }
        return b.color.area - a.color.area; // Sort by area in descending order
      })
      .filter(({ color, i }) => {
        const isGrey = distanceFromGrey(color.hex) < 2;
        const isTooDark = getLuminance(color.hex) < 0.1;
        const isDuplicate = extractedColors.findIndex((t) => t.hex === color.hex) !== i;

        // Check if this color is similar to any we've already processed
        const isSimilarToProcessed = [...processedIndices].some(
          j => areAboutEqual(color.hex, extractedColors[j].hex, 15)
        );

        if (isGrey || isTooDark || isDuplicate || isSimilarToProcessed)
          return false;

        processedIndices.add(i);
        return true;
      })
      .sort((a, b) => b.color.area - a.color.area) // Sort by area in descending order
      .map(({ color }) => color);
  };

  for await (const num of new Array(iterations).keys()) {
    const currentAmount = filteredColors().length;

    if (currentAmount >= minAmount) {
      return filteredColors();
    }

    const newColors = await extract(src, { distance: 0.22 - (7 * num) });

    // Remove duplicates and sort by area
    extractedColors = [...extractedColors, ...newColors];
  }

  // else retry with a finer scan
  return filteredColors();
};