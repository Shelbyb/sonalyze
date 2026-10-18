export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Treat the request as safe to repeat even if the method is not idempotent. */
  idempotent?: boolean;
}

const IDEMPOTENT = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function retryAfterMs(res: Response): number | null {
  const seconds = Number(res.headers?.get?.('Retry-After'));
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
}

/**
 * `fetch` with exponential backoff and jitter.
 * Retries network errors, HTTP 429 and 5xx. Non-idempotent methods (e.g. POST)
 * are retried only on HTTP 429, where the server did not process the request.
 * The last response is returned (not thrown) once retries are exhausted;
 * network errors are rethrown.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  {
    retries = 2,
    baseDelayMs = 400,
    maxDelayMs = 5000,
    idempotent: forceIdempotent = false,
  }: RetryOptions = {},
): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const idempotent = forceIdempotent || IDEMPOTENT.has(method);

  for (let attempt = 0; ; attempt++) {
    const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
    const delay = backoff / 2 + Math.random() * (backoff / 2);
    try {
      const res = await fetch(input, init);
      const retryable = res.status === 429 || (res.status >= 500 && idempotent);
      if (!retryable || attempt >= retries) return res;
      await sleep(Math.min(maxDelayMs, retryAfterMs(res) ?? delay));
    } catch (err) {
      if (!idempotent || attempt >= retries || init?.signal?.aborted) throw err;
      await sleep(delay);
    }
  }
}
