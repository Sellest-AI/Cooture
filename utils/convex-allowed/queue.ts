function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

type Options = {
  delayMs: number
  batchSize: number
}

const DEFAULT_OPTIONS = {
  delayMs: 0,
  batchSize: Infinity,
} satisfies Options;

export async function runPromiseQueue<T>(
  tasks: Promise<T>[],
  options: Options = DEFAULT_OPTIONS,
): Promise<T[]> {
  const { delayMs, batchSize } = { ...DEFAULT_OPTIONS, ...options };
  const results: T[] = [];

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);

    // Execute all tasks in the batch concurrently
    const batchResults = await Promise.all(batch.map(fn => fn));
    results.push(...batchResults);

    // Only delay if more batches remain
    if (i + batchSize < tasks.length) {
      await delay(delayMs);
    }
  }

  return results;
}

const runPromiseDelay = <T>(tasks: Promise<T>[], delayMs: number) =>
  runPromiseQueue<T>(tasks, { delayMs, batchSize: 1 });

const runPromiseBatch = <T>(tasks: Promise<T>[], batchSize: number) =>
  runPromiseQueue<T>(tasks, { batchSize, delayMs: 0 });

export class Promises {
  static queue = runPromiseQueue;
  static delay = runPromiseDelay;
  static batch = runPromiseBatch;
}