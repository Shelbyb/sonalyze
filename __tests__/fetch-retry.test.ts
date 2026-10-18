import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithRetry } from '@/lib/fetch-retry';

const fast = { baseDelayMs: 1, maxDelayMs: 2 };

describe('fetchWithRetry', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('retries 5xx on GET then succeeds', async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response('ok'));
    vi.stubGlobal('fetch', f);
    const res = await fetchWithRetry('/x', undefined, fast);
    expect(res.status).toBe(200);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('retries network errors for idempotent requests and rethrows when exhausted', async () => {
    const f = vi.fn().mockRejectedValue(new Error('net'));
    vi.stubGlobal('fetch', f);
    await expect(fetchWithRetry('/x', undefined, fast)).rejects.toThrow('net');
    expect(f).toHaveBeenCalledTimes(3);
  });

  it('does not retry POST on 5xx but retries on 429', async () => {
    const f = vi.fn().mockResolvedValue(new Response('', { status: 500 }));
    vi.stubGlobal('fetch', f);
    await fetchWithRetry('/x', { method: 'POST' }, fast);
    expect(f).toHaveBeenCalledTimes(1);

    const g = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 429 }))
      .mockResolvedValueOnce(new Response('ok'));
    vi.stubGlobal('fetch', g);
    const res = await fetchWithRetry('/x', { method: 'POST' }, fast);
    expect(res.status).toBe(200);
    expect(g).toHaveBeenCalledTimes(2);
  });

  it('does not retry 4xx', async () => {
    const f = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
    vi.stubGlobal('fetch', f);
    await fetchWithRetry('/x', undefined, fast);
    expect(f).toHaveBeenCalledTimes(1);
  });
});
