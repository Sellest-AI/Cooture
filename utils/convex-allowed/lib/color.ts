// Optimized for CIEDE2000 Perceptual Distances
const INTERNAL_COLOR_TAGS = [
  // Blue
  { tag: "blue", r: 0, g: 0, b: 255 },       // Standard Blue
  { tag: "blue", r: 0, g: 0, b: 128 },       // Navy
  { tag: "blue", r: 135, g: 206, b: 235 },   // Sky Blue
  { tag: "blue", r: 0, g: 191, b: 255 },     // Deep Sky Blue
  { tag: "blue", r: 176, g: 196, b: 222 },   // Light Steel Blue
  { tag: "blue", r: 45, g: 60, b: 110 },     // Muted Dark Blue
  { tag: "blue", r: 33, g: 137, b: 163 },    // Teal Blue
  { tag: "blue", r: 23, g: 95, b: 113 },     // Dark Teal Blue

  // Green
  { tag: "green", r: 0, g: 128, b: 0 },      // Standard Green
  { tag: "green", r: 144, g: 238, b: 144 },  // Light Green
  { tag: "green", r: 0, g: 100, b: 0 },      // Dark Green
  { tag: "green", r: 50, g: 205, b: 50 },    // Lime Green
  { tag: "green", r: 140, g: 170, b: 140 },  // Sage Green
  { tag: "green", r: 200, g: 230, b: 200 },  // Pale Green

  // Beige
  { tag: "beige", r: 245, g: 245, b: 220 },  // Standard Beige
  { tag: "beige", r: 227, g: 218, b: 201 },  // Warm Beige
  { tag: "beige", r: 200, g: 185, b: 160 },  // Dark/Neutral Beige

  // Pink
  { tag: "pink", r: 255, g: 192, b: 203 },   // Standard Pink
  { tag: "pink", r: 255, g: 105, b: 180 },   // Hot Pink
  { tag: "pink", r: 255, g: 20, b: 147 },    // Deep Pink
  { tag: "pink", r: 165, g: 40, b: 85 },     // Dark Pink / Raspberry 

  // Brown
  { tag: "brown", r: 139, g: 69, b: 19 },    // Saddle Brown
  { tag: "brown", r: 101, g: 67, b: 33 },    // Dark Brown
  { tag: "brown", r: 210, g: 105, b: 30 },   // Light Brown
  { tag: "brown", r: 165, g: 140, b: 130 },  // Light Taupe
  { tag: "brown", r: 115, g: 90, b: 80 },    // Muted Taupe-Brown
  { tag: "brown", r: 65, g: 50, b: 45 },     // Dark Warm Brown
  { tag: "brown", r: 38, g: 35, b: 32 },     // Espresso / Very Dark Brown
  { tag: "brown", r: 135, g: 95, b: 105 },   // Dusty Violet-Brown
  { tag: "brown", r: 45, g: 32, b: 35 },     // Very Dark Violet-Brown
  { tag: "brown", r: 85, g: 43, b: 51 },     // Deep Mahogany (Pulls #552b33, #33191f)
  { tag: "brown", r: 153, g: 77, b: 92 },    // Rose Brown (Pulls #994d5c, #773c47)
  { tag: "brown", r: 195, g: 136, b: 148 },  // Light Rose Brown (Pulls #c38894, #b36675)

  // Black
  { tag: "black", r: 0, g: 0, b: 0 },        // Pure Black
  { tag: "black", r: 30, g: 30, b: 30 },     // Strict Off-Black (User Requested)

  // Grey
  { tag: "grey", r: 128, g: 128, b: 128 },   // Standard Grey
  { tag: "grey", r: 169, g: 169, b: 169 },   // Medium Grey
  { tag: "grey", r: 211, g: 211, b: 211 },   // Light Grey
  { tag: "grey", r: 105, g: 105, b: 105 },   // Dark Grey
  { tag: "grey", r: 75, g: 75, b: 75 },      // Charcoal Grey
  { tag: "grey", r: 112, g: 128, b: 144 },   // Slate Grey

  // White
  { tag: "white", r: 255, g: 255, b: 255 },  // Pure White
  { tag: "white", r: 248, g: 248, b: 255 },  // Ghost White
  { tag: "white", r: 255, g: 250, b: 240 },  // Floral White

  // Yellow
  { tag: "yellow", r: 255, g: 255, b: 0 },   // Pure Yellow
  { tag: "yellow", r: 255, g: 215, b: 0 },   // Gold
  { tag: "yellow", r: 255, g: 250, b: 205 }, // Lemon Chiffon / Light

  // Orange
  { tag: "orange", r: 255, g: 165, b: 0 },   // Standard Orange
  { tag: "orange", r: 255, g: 140, b: 0 },   // Dark Orange
  { tag: "orange", r: 255, g: 127, b: 80 },  // Coral

  // Red
  { tag: "red", r: 255, g: 0, b: 0 },        // Pure Red
  { tag: "red", r: 220, g: 20, b: 60 },      // Crimson
  { tag: "red", r: 139, g: 0, b: 0 },        // Dark Red
  { tag: "red", r: 55, g: 15, b: 25 },       // Maroon 
  { tag: "red", r: 135, g: 45, b: 60 },      // Berry Red 
  { tag: "red", r: 210, g: 120, b: 140 },    // Dusty Red / Rose 
  { tag: "red", r: 236, g: 198, b: 205 },    // Pale Blush Red 

  // Purple
  { tag: "purple", r: 128, g: 0, b: 128 },   // Standard Purple
  { tag: "purple", r: 230, g: 230, b: 250 }, // Lavender
  { tag: "purple", r: 138, g: 43, b: 226 },  // Blue Violet
  { tag: "purple", r: 75, g: 0, b: 130 },    // Indigo
  { tag: "purple", r: 114, g: 81, b: 108 },  // Dusty Purple
  { tag: "purple", r: 75, g: 57, b: 79 },    // Dark Muted Purple 
  { tag: "purple", r: 42, g: 32, b: 45 },    // Very Dark Purple 
  { tag: "purple", r: 221, g: 130, b: 244 }, // Bright Lilac
  { tag: "purple", r: 236, g: 185, b: 249 }  // Pale Lilac
];

export const COLOR_TAGS = INTERNAL_COLOR_TAGS.filter((t, i) => {
  return INTERNAL_COLOR_TAGS.findIndex((ct) => ct.tag === t.tag) === i;
});

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : { r: 0, g: 0, b: 0 };
}

type LAB = { l: number; a: number; b: number };

function rgbToLab(r: number, g: number, b: number): LAB {
  let r_ = r / 255,
    g_ = g / 255,
    b_ = b / 255;
  r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
  g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
  b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

  r_ *= 100;
  g_ *= 100;
  b_ *= 100;

  const x = r_ * 0.4124564 + g_ * 0.3575761 + b_ * 0.1804375;
  const y = r_ * 0.2126729 + g_ * 0.7151522 + b_ * 0.072175;
  const z = r_ * 0.0193339 + g_ * 0.119192 + b_ * 0.9503041;

  let x_ = x / 95.047;
  let y_ = y / 100.0;
  let z_ = z / 108.883;

  x_ = x_ > 0.008856 ? Math.pow(x_, 1 / 3) : 7.787 * x_ + 16 / 116;
  y_ = y_ > 0.008856 ? Math.pow(y_, 1 / 3) : 7.787 * y_ + 16 / 116;
  z_ = z_ > 0.008856 ? Math.pow(z_, 1 / 3) : 7.787 * z_ + 16 / 116;

  return {
    l: 116 * y_ - 16,
    a: 500 * (x_ - y_),
    b: 200 * (y_ - z_),
  };
}

function deltaE2000(lab1: LAB, lab2: LAB): number {
  const rad2deg = (rad: number) => (rad * 180) / Math.PI;
  const deg2rad = (deg: number) => (deg * Math.PI) / 180;

  const { l: L1, a: a1, b: b1 } = lab1;
  const { l: L2, a: a2, b: b2 } = lab2;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;

  const Cbar7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + 6103515625)));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);
  const Cbarp = (C1p + C2p) / 2;

  let h1p = rad2deg(Math.atan2(b1, a1p));
  if (h1p < 0) h1p += 360;
  let h2p = rad2deg(Math.atan2(b2, a2p));
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
    else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
    else dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deg2rad(dhp) / 2);

  const Lbarp = (L1 + L2) / 2;
  let hbarp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
    else if (h1p + h2p < 360) hbarp = (h1p + h2p + 360) / 2;
    else hbarp = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(deg2rad(hbarp - 30)) +
    0.24 * Math.cos(deg2rad(2 * hbarp)) +
    0.32 * Math.cos(deg2rad(3 * hbarp + 6)) -
    0.2 * Math.cos(deg2rad(4 * hbarp - 63));

  const dTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(Cbarp, 7) / (Math.pow(Cbarp, 7) + 6103515625));

  const LbarpMinus50Sq = Math.pow(Lbarp - 50, 2);
  const SL = 1 + (0.015 * LbarpMinus50Sq) / Math.sqrt(20 + LbarpMinus50Sq);
  const SC = 1 + 0.045 * Cbarp;
  const SH = 1 + 0.015 * Cbarp * T;
  const RT = -Math.sin(deg2rad(2 * dTheta)) * RC;

  return Math.sqrt(
    Math.pow(dLp / SL, 2) +
    Math.pow(dCp / SC, 2) +
    Math.pow(dHp / SH, 2) +
    RT * (dCp / SC) * (dHp / SH)
  );
}

const COLOR_TAGS_LAB = INTERNAL_COLOR_TAGS.map((t) => ({
  ...t,
  lab: rgbToLab(t.r, t.g, t.b),
}));

export function getTagsFromHexColors(hexColors: string[]): string[] {
  const tags = new Set<string>();

  for (const hex of hexColors) {
    const { r, g, b } = hexToRgb(hex);
    const lab = rgbToLab(r, g, b);

    let bestTag = COLOR_TAGS_LAB[0].tag;
    let minDeltaE = Infinity;

    for (const ct of COLOR_TAGS_LAB) {
      const dE = deltaE2000(ct.lab, lab);

      if (dE < minDeltaE) {
        minDeltaE = dE;
        bestTag = ct.tag;
      }
    }
    tags.add(bestTag);
  }

  return Array.from(tags);
}