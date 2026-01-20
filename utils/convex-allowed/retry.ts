export async function retryPromise<T>(fn: () => Promise<T>, retries = 10) {
  for (let i = 0; i < retries; i++) {
    // random between 150ms & 500ms
    const delay = Math.floor(Math.random() * (350 - 150 + 1)) + 150;

    try {
      return await fn();
    } catch {
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error(`Failed to execute promise after ${retries} retries`);
}
