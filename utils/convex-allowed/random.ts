function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

// Simple seedable PRNG (Mulberry32)
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Create a shuffled copy of an array using a seed string.
 * This function uses a simple seeded random number generator to ensure
 * the same input string always produces the same shuffled output.
 * @param array - The array to shuffle.
 * @param seedString - The seed string to use for shuffling.
 * @returns A new array with the shuffled elements.
 */
export function shuffleWithSeed<T>(array: T[], seed: string | number): T[] {
  const seedString = typeof seed === 'number' ? seed.toString() : seed;
  const _seed = stringToSeed(seedString);
  const random = mulberry32(_seed);
  const arr = array.slice(); // Make a copy

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function extractWithSeed<T>(array: T[], seedString?: string | number): T {
  const seed = typeof seedString === 'number' ? seedString : stringToSeed(seedString ?? '');
  const random = mulberry32(seed);
  const index = Math.floor(random() * array.length);
  return array[index];
}