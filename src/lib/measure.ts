// Pomiar czasu wykonania funkcji asynchronicznych lub synchronicznych

export async function measureMs<T>(fn: () => Promise<T> | T): Promise<{ elapsedMs: number; result: T }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { elapsedMs: end - start, result };
}


