import { extractDominantVibrantColor, getLighterHsl, getSaturatedHsl, hslToHex, parseColorToHsl } from "@shared/utils";

// Get the most saturated color among the items to use as background color
export const getBackgroundColor = (colors: string[]) => {
  const fallbackColor = 'rgb(230,230,220)';

  const dominantColor = extractDominantVibrantColor(colors, true);
  if (!dominantColor) return fallbackColor;
  const hsl = parseColorToHsl(dominantColor);
  if (!hsl) return fallbackColor;

  const result = getSaturatedHsl(getLighterHsl(hsl, 85, 97), 30);

  return hslToHex(...result);
}