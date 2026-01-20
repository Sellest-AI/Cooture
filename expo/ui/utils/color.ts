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
export function getDarkerHsl(hsl: [number, number, number], amount: number): [number, number, number] {
  const [h, s, l] = hsl;
  return [h, s, Math.max(l - amount, 0)]; // Reduce lightness but ensure it's >= 0
}

// Generate a lighter color
export function getLighterHsl(hsl: [number, number, number], amount: number): [number, number, number] {
  const [h, s, l] = hsl;
  return [h, s, Math.min(l + amount, 100)]; // Reduce lightness but ensure it's >= 0
}

// Generate saturated color
export function getSaturatedHsl(hsl: [number, number, number], amount: number): [number, number, number] {
  const [h, s, l] = hsl;
  return [h, Math.min(s + amount, 100), l]; // Increase saturation but ensure it's <= 100
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
