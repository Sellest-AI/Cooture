// Convert HSL back to a string
export function hslToString(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function hslStringToHsl(hsl: string): [number, number, number] | null {
  const [h, s, l] = hsl.match(/\d+/g)!.map(Number);
  if (!h || !s || !l) return null;
  return [h, s, l];
}

// Generate a darker color
export function getDarkerHsl(hsl: [number, number, number], amount: number, cap = 0): [number, number, number] {
  const [h, s, l] = hsl;
  return [h, s, Math.max(l - amount, cap)]; // Reduce lightness but ensure it's >= 0
}

// Generate a lighter color
export function getLighterHsl(hsl: [number, number, number], amount: number, cap = 100): [number, number, number] {
  const [h, s, l] = hsl;
  return [h, s, Math.min(l + amount, cap)]; // Reduce lightness but ensure it's >= 0
}

// Generate saturated color
export function getSaturatedHsl(hsl: [number, number, number], amount: number, cap = 100): [number, number, number] {
  const [h, s, l] = hsl;
  return [h, Math.min(s + amount, cap), l]; // Increase saturation but ensure it's <= 100
}

export const hslWithAlpha = (color: string, alpha: number) => {
  if (color.startsWith('hsl')) {
    return color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
  }
  return color;
};

// Convert HSL to Hex
export function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert a color string to HSL format
export function parseColorToHsl(color: string): [number, number, number] | null {
  // Check if computedColor is in HEX format and convert to RGB if necessary
  let r: number, g: number, b: number;

  if (color.startsWith('hsl(')) {
    const hsl = color.match(/\d+/g)?.map(Number);
    if (!hsl || hsl.length < 3) return null;
    return [hsl[0]!, hsl[1]!, hsl[2]!];
  }

  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    // Parse HEX to RGB
    r = parseInt(color.slice(1, 3), 16) / 255;
    g = parseInt(color.slice(3, 5), 16) / 255;
    b = parseInt(color.slice(5, 7), 16) / 255;
  } else {
    // Extract RGB values from color
    const rgb = color.match(/\d+/g)?.map(Number);
    if (!rgb || rgb.length < 3) return null;
    r = rgb[0]! / 255;
    g = rgb[1]! / 255;
    b = rgb[2]! / 255;
  }

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;

  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}


// Convert a color string to HSL format
export function parseColorToHslCanvas(color: string): [number, number, number] | null {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;

  // Set the fillStyle to normalize the input
  ctx.fillStyle = color;
  const computedColor = ctx.fillStyle;

  // Check if computedColor is in HEX format and convert to RGB if necessary
  let r: number, g: number, b: number;

  if (/^#[0-9A-Fa-f]{6}$/.test(computedColor)) {
    // Parse HEX to RGB
    r = parseInt(computedColor.slice(1, 3), 16) / 255;
    g = parseInt(computedColor.slice(3, 5), 16) / 255;
    b = parseInt(computedColor.slice(5, 7), 16) / 255;
  } else {
    // Extract RGB values from computedColor
    const rgb = computedColor.match(/\d+/g)?.map(Number);
    if (!rgb || rgb.length < 3) return null;
    r = rgb[0]! / 255;
    g = rgb[1]! / 255;
    b = rgb[2]! / 255;
  }

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;

  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Extract the dominant vibrant color from an array of hex colors
 * Improved version with better color clustering and selection
 */
export function extractDominantVibrantColor(
  colors: string[],
  useAverage: boolean = false // Set to true for averaged color, false for most vibrant
): string | null {
  if (!colors.length) return null;

  // Convert all colors to HSL
  const hslColors = colors
    .map(color => parseColorToHsl(color))
    .filter((hsl): hsl is [number, number, number] => hsl !== null);

  if (!hslColors.length) return null;

  // Filter out very light (near white) and very dark (near black) colors
  // and very desaturated (gray) colors
  const filteredColors = hslColors.filter(([h, s, l]) => {
    return l > 15 && l < 85 && s > 10; // Keep colors with some saturation and reasonable lightness
  });

  if (!filteredColors.length) {
    // Fallback to all colors if filtering removed everything
    return hslToString(...hslColors[0]!);
  }

  // Group similar colors with tighter clustering
  const colorGroups: { colors: [number, number, number][]; weight: number }[] = [];

  for (const color of filteredColors) {
    let addedToGroup = false;

    for (const group of colorGroups) {
      const representative = group.colors[0]!;
      const [h1, s1, l1] = representative;
      const [h2, s2, l2] = color;

      // Calculate hue difference (accounting for circular nature)
      let hueDiff = Math.abs(h1 - h2);
      if (hueDiff > 180) hueDiff = 360 - hueDiff;

      // For browns/oranges/reds (0-60), be more lenient with hue
      // For other colors, be stricter
      const hueThreshold = (h1 < 60 || h2 < 60) ? 40 : 25;

      if (hueDiff < hueThreshold && Math.abs(s1 - s2) < 25 && Math.abs(l1 - l2) < 25) {
        group.colors.push(color);
        group.weight++;
        addedToGroup = true;
        break;
      }
    }

    if (!addedToGroup) {
      colorGroups.push({ colors: [color], weight: 1 });
    }
  }

  // Sort groups by weight (number of similar colors)
  colorGroups.sort((a, b) => b.weight - a.weight);

  // Get the dominant group
  const dominantGroup = colorGroups[0]!;

  if (useAverage) {
    // Calculate average color of the dominant group for more balanced representation
    const avgHue = dominantGroup.colors.reduce((sum, [h]) => sum + h, 0) / dominantGroup.colors.length;
    const avgSat = dominantGroup.colors.reduce((sum, [, s]) => sum + s, 0) / dominantGroup.colors.length;
    const avgLight = dominantGroup.colors.reduce((sum, [, , l]) => sum + l, 0) / dominantGroup.colors.length;

    return hslToString(Math.round(avgHue), Math.round(avgSat), Math.round(avgLight));
  } else {
    // From the dominant group, find the most vibrant/saturated color
    const mostVibrant = dominantGroup.colors.reduce((best, current) => {
      const [, s1, l1] = best;
      const [, s2, l2] = current;

      // Vibrancy score: heavily favor saturation, moderate lightness preference
      const vibrancy1 = s1 * 1.5 + (50 - Math.abs(l1 - 50));
      const vibrancy2 = s2 * 1.5 + (50 - Math.abs(l2 - 50));

      return vibrancy2 > vibrancy1 ? current : best;
    });

    return hslToString(...mostVibrant);
  }
}
