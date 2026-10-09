import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from '@/lib/auth';

describe('Auth Configuration & Callbacks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('configures JWT session strategy and Spotify provider', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
    expect(authOptions.pages?.signIn).toBe('/');
    expect(authOptions.providers.length).toBeGreaterThan(0);
  });

  it('handles initial sign-in in jwt callback', async () => {
    const jwtCallback = authOptions.callbacks?.jwt;
    expect(jwtCallback).toBeDefined();

    const mockAccount: any = {
      access_token: 'acc_123',
      refresh_token: 'ref_123',
      expires_at: 1800000000,
    };
    const mockProfile: any = {
      id: 'spotify_user_1',
    };

    const token = await (jwtCallback as any)({
      token: {},
      account: mockAccount,
      profile: mockProfile,
      user: {} as any,
    });

    expect(token.accessToken).toBe('acc_123');
    expect(token.refreshToken).toBe('ref_123');
    expect((token as any).spotifyId).toBe('spotify_user_1');
  });

  it('returns unexpired token as-is in jwt callback', async () => {
    const jwtCallback = authOptions.callbacks?.jwt;
    const existingToken: any = {
      accessToken: 'current_acc',
      refreshToken: 'current_ref',
      accessTokenExpires: Date.now() + 3600000,
    };

    const token = await (jwtCallback as any)({
      token: existingToken,
    });

    expect(token.accessToken).toBe('current_acc');
  });

  it('refreshes expired token in jwt callback', async () => {
    const jwtCallback = authOptions.callbacks?.jwt;
    const expiredToken: any = {
      accessToken: 'old_acc',
      refreshToken: 'valid_refresh',
      accessTokenExpires: Date.now() - 10000,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new_refreshed_acc',
        expires_in: 3600,
        refresh_token: 'new_ref',
      }),
    });

    const refreshed = await (jwtCallback as any)({
      token: expiredToken,
    });

    expect(refreshed.accessToken).toBe('new_refreshed_acc');
  });

  it('populates session object in session callback', async () => {
    const sessionCallback = authOptions.callbacks?.session;
    expect(sessionCallback).toBeDefined();

    const mockSession: any = { user: { name: 'Alex' } };
    const mockToken: any = {
      accessToken: 'token_xyz',
      spotifyId: 'user_xyz',
      error: undefined,
    };

    const result: any = await (sessionCallback as any)({
      session: mockSession,
      token: mockToken,
      user: {} as any,
      newSession: undefined,
      trigger: 'update',
    });

    expect(result.accessToken).toBe('token_xyz');
    expect(result.spotifyId).toBe('user_xyz');
  });
});
