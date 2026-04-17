export const COLOR_TAGS = [
  { tag: "blue", r: 90, g: 130, b: 180 },
  { tag: "green", r: 100, g: 150, b: 110 },
  { tag: "beige", r: 225, g: 210, b: 190 },
  { tag: "pink", r: 220, g: 160, b: 170 },
  { tag: "brown", r: 130, g: 90, b: 60 },
  { tag: "black", r: 15, g: 15, b: 15 },
  { tag: "grey", r: 150, g: 150, b: 150 },
  { tag: "white", r: 245, g: 245, b: 245 },
  { tag: "yellow", r: 220, g: 200, b: 110 },
  { tag: "orange", r: 210, g: 130, b: 80 },
  { tag: "red", r: 190, g: 80, b: 80 },
  { tag: "purple", r: 140, g: 110, b: 150 },
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export function getTagsFromHexColors(hexColors: string[]): string[] {
  const tags = new Set<string>();

  for (const hex of hexColors) {
    const { r, g, b } = hexToRgb(hex);
    let bestTag = COLOR_TAGS[0].tag;
    let minDistanceSq = Infinity;

    for (const ct of COLOR_TAGS) {
      const dr = ct.r - r;
      const dg = ct.g - g;
      const db = ct.b - b;
      const distanceSq = dr * dr + dg * dg + db * db;

      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        bestTag = ct.tag;
      }
    }
    tags.add(bestTag);
  }

  return Array.from(tags);
}