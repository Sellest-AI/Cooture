import sharp from 'sharp';
import { imageBufferFromUrl } from './image.buffer';

/**
 * Extract the main colors from an image buffer with prioritization for color diversity.
 * - Resizes the image to a small size for performance
 * - Quantizes colors to 5 bits per channel and builds a frequency map
 * - Uses an adaptive strategy to ensure diverse colors are extracted
 * - Returns the top `count` colors as hex strings (e.g. `#aabbcc`)
 */
export async function extractMainColors(
  image: Buffer | string,
  count = 5,
  opts?: { resize?: number; diversityWeight?: number }
): Promise<string[]> {
  const resize = opts?.resize ?? 512;
  const diversityWeight = opts?.diversityWeight ?? 0.3; // Balance between frequency and diversity

  const buffer = typeof image === 'string' ? await imageBufferFromUrl(image) : image;
  const { data, info } = await sharp(buffer)
    .resize({ width: resize, height: resize, fit: 'inside' })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const bins = new Map<number, number>();

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0 || a < 30) continue;

    // Quantize to 5 bits per channel (0-31)
    const r5 = r >> 3;
    const g5 = g >> 3;
    const b5 = b >> 3;
    const key = (r5 << 10) | (g5 << 5) | b5;
    bins.set(key, (bins.get(key) || 0) + 1);
  }

  if (bins.size === 0) return [];

  // Convert bins to color objects
  const colors = Array.from(bins.entries()).map(([key, cnt]) => {
    const r5 = (key >> 10) & 31;
    const g5 = (key >> 5) & 31;
    const b5 = key & 31;
    const r = r5 * 8 + 4;
    const g = g5 * 8 + 4;
    const b = b5 * 8 + 4;
    return { r, g, b, count: cnt };
  });

  colors.sort((a, b) => b.count - a.count);

  // Distance function
  function distSq(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return dr * dr + dg * dg + db * db;
  }

  // Step 1: Aggressive initial clustering to merge very similar colors
  const initialMergeThreshold = 40 * 40; // Merge colors within distance 40
  const initialClusters: { r: number; g: number; b: number; count: number }[] = [];

  for (const color of colors) {
    let merged = false;

    for (const cluster of initialClusters) {
      if (distSq(color, cluster) <= initialMergeThreshold) {
        const total = cluster.count + color.count;
        cluster.r = Math.round((cluster.r * cluster.count + color.r * color.count) / total);
        cluster.g = Math.round((cluster.g * cluster.count + color.g * color.count) / total);
        cluster.b = Math.round((cluster.b * cluster.count + color.b * color.count) / total);
        cluster.count = total;
        merged = true;
        break;
      }
    }

    if (!merged) {
      initialClusters.push({ ...color });
    }
  }

  initialClusters.sort((a, b) => b.count - a.count);

  // If we have fewer clusters than needed, return them all
  if (initialClusters.length <= count) {
    return clustersToHex(initialClusters);
  }

  // Step 2: Use diversity-aware selection
  // Select colors that maximize both frequency AND distance from already selected colors
  const selected: { r: number; g: number; b: number; count: number }[] = [];

  // Always start with the most frequent color
  selected.push(initialClusters[0]);

  // Iteratively select colors that balance frequency and diversity
  while (selected.length < count && selected.length < initialClusters.length) {
    let bestColor = null;
    let bestScore = -Infinity;

    for (const candidate of initialClusters) {
      // Skip if already selected
      if (selected.includes(candidate)) continue;

      // Calculate minimum distance to any selected color
      let minDistSq = Infinity;
      for (const sel of selected) {
        const d = distSq(candidate, sel);
        if (d < minDistSq) minDistSq = d;
      }

      // Normalize count (0-1 range based on max count)
      const normalizedCount = candidate.count / initialClusters[0].count;

      // Normalize distance (use sqrt to get actual distance, normalize to 0-1)
      // Max possible distance in RGB space is sqrt(255^2 * 3) ≈ 441
      const normalizedDist = Math.sqrt(minDistSq) / 441;

      // Score combines frequency (higher is better) and diversity (higher distance is better)
      // diversityWeight controls the balance
      const score = (1 - diversityWeight) * normalizedCount + diversityWeight * normalizedDist;

      if (score > bestScore) {
        bestScore = score;
        bestColor = candidate;
      }
    }

    if (bestColor) {
      selected.push(bestColor);
    } else {
      break;
    }
  }

  return clustersToHex(selected);
}

function clustersToHex(clusters: { r: number; g: number; b: number; count: number }[]): string[] {
  return clusters.map((c) => {
    const hex = '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');
    return hex;
  });
}

export default extractMainColors;