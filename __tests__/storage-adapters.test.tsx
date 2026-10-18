import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { browserAdapter } from '@/lib/storage/adapters/browser';
import { apiAdapter } from '@/lib/storage/adapters/api';
import { useCapabilities, resetCapabilitiesCache } from '@/hooks/useCapabilities';

describe('storage adapters', () => {
  beforeEach(() => {
    resetCapabilitiesCache();
  });

  it('browser adapter is a no-op', async () => {
    expect(await browserAdapter.loadUser()).toEqual({
      user: null,
      preferences: null,
    });
  });

  it('api adapter calls preferences endpoint', async () => {
    const f = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ user: null, preferences: { volume: 1 } })),
      );
    vi.stubGlobal('fetch', f);
    const out = await apiAdapter.loadUser();
    expect(out.preferences).toEqual({ volume: 1 });
    expect(f.mock.calls[0][0]).toBe('/api/user/preferences');
  });

  it('useCapabilities reads capabilities and falls back on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            mode: 'postgres',
            history: true,
            tags: true,
            syncedPrefs: true,
          }),
        ),
      ),
    );
    const { result } = renderHook(() => useCapabilities());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.mode).toBe('postgres');
    resetCapabilitiesCache();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('x')));
    const r2 = renderHook(() => useCapabilities());
    await waitFor(() => expect(r2.result.current.loaded).toBe(true));
    expect(r2.result.current.mode).toBe('browser');
  });
});
