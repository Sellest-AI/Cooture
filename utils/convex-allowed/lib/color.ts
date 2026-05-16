const INTERNAL_COLOR_TAGS = [
  { tag: "blue", r: 90, g: 130, b: 180 },
  { tag: "blue", r: 17, g: 25, b: 48 },
  { tag: "blue", r: 33, g: 67, b: 101 },
  { tag: "green", r: 100, g: 150, b: 110 },
  { tag: "green", r: 74, g: 124, b: 89 },
  { tag: "green", r: 124, g: 150, b: 90 },
  { tag: "beige", r: 225, g: 210, b: 190 },
  { tag: "pink", r: 220, g: 160, b: 170 },
  { tag: "pink", r: 243, g: 197, b: 197 },
  { tag: "brown", r: 130, g: 90, b: 60 },
  { tag: "brown", r: 51, g: 42, b: 42 },
  { tag: "brown", r: 29, g: 27, b: 23 },
  { tag: "brown", r: 84, g: 72, b: 73 },
  { tag: "black", r: 34, g: 34, b: 34 },
  { tag: "black", r: 15, g: 15, b: 15 },
  { tag: "grey", r: 150, g: 150, b: 150 },
  { tag: "grey", r: 70, g: 83, b: 89 },
  { tag: "grey", r: 171, g: 162, b: 158 },
  { tag: "white", r: 245, g: 245, b: 245 },
  { tag: "yellow", r: 220, g: 200, b: 110 },
  { tag: "orange", r: 210, g: 130, b: 80 },
  { tag: "orange", r: 217, g: 119, b: 70 },
  { tag: "red", r: 190, g: 80, b: 80 },
  { tag: "red", r: 152, g: 64, b: 88 },
  { tag: "purple", r: 140, g: 110, b: 150 },
  { tag: "purple", r: 138, g: 123, b: 155 },
];

export const COLOR_TAGS = INTERNAL_COLOR_TAGS.filter((t, i) => {
  return INTERNAL_COLOR_TAGS.findIndex(ct => ct.tag === t.tag) === i;
})

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToLab(r: number, g: number, b: number) {
  let r_ = r / 255, g_ = g / 255, b_ = b / 255;
  r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
  g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
  b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

  r_ *= 100; g_ *= 100; b_ *= 100;

  const x = r_ * 0.4124564 + g_ * 0.3575761 + b_ * 0.1804375;
  const y = r_ * 0.2126729 + g_ * 0.7151522 + b_ * 0.0721750;
  const z = r_ * 0.0193339 + g_ * 0.1191920 + b_ * 0.9503041;

  let x_ = x / 95.047;
  let y_ = y / 100.000;
  let z_ = z / 108.883;

  x_ = x_ > 0.008856 ? Math.pow(x_, 1 / 3) : (7.787 * x_) + (16 / 116);
  y_ = y_ > 0.008856 ? Math.pow(y_, 1 / 3) : (7.787 * y_) + (16 / 116);
  z_ = z_ > 0.008856 ? Math.pow(z_, 1 / 3) : (7.787 * z_) + (16 / 116);

  return {
    l: (116 * y_) - 16,
    a: 500 * (x_ - y_),
    b: 200 * (y_ - z_)
  };
}

const COLOR_TAGS_LAB = INTERNAL_COLOR_TAGS.map(t => ({
  ...t,
  lab: rgbToLab(t.r, t.g, t.b)
}));

export function getTagsFromHexColors(hexColors: string[]): string[] {
  const tags = new Set<string>();

  for (const hex of hexColors) {
    const { r, g, b } = hexToRgb(hex);
    const lab = rgbToLab(r, g, b);

    let bestTag = COLOR_TAGS_LAB[0].tag;
    let minDistanceSq = Infinity;

    for (const ct of COLOR_TAGS_LAB) {
      const dl = ct.lab.l - lab.l;
      const da = ct.lab.a - lab.a;
      const db = ct.lab.b - lab.b;
      const distanceSq = dl * dl + da * da + db * db;

      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        bestTag = ct.tag;
      }
    }
    tags.add(bestTag);
  }

  return Array.from(tags);
}
