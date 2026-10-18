import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import UserStoreSync from '@/components/UserStoreSync';
import * as spotifyLib from '@/lib/spotify';
import * as nextAuthReact from 'next-auth/react';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

describe('useUserStore Zustand Store & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useUserStore.getState().reset();
    });
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.preferences.defaultTimeRange).toBe('medium_term');
    expect(state.preferences.volume).toBe(0.8);
    expect(state.preferences.audioAutoplay).toBe(false);
  });

  it('updates and persists user profile via setUser and updateUser', () => {
    act(() => {
      useUserStore.getState().setUser({
        id: 'user-123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        image: 'https://example.com/avatar.jpg',
      });
    });

    let state = useUserStore.getState();
    expect(state.user?.id).toBe('user-123');
    expect(state.user?.name).toBe('Jane Doe');
    expect(state.lastSyncedAt).not.toBeNull();

    act(() => {
      useUserStore.getState().updateUser({
        country: 'US',
        product: 'premium',
      });
    });

    state = useUserStore.getState();
    expect(state.user?.name).toBe('Jane Doe');
    expect(state.user?.country).toBe('US');
    expect(state.user?.product).toBe('premium');
  });

  it('updates preferences correctly', () => {
    act(() => {
      useUserStore.getState().setDefaultTimeRange('short_term');
      useUserStore.getState().setVolume(0.5);
      useUserStore.getState().setAudioAutoplay(true);
    });

    const state = useUserStore.getState();
    expect(state.preferences.defaultTimeRange).toBe('short_term');
    expect(state.preferences.volume).toBe(0.5);
    expect(state.preferences.audioAutoplay).toBe(true);

    act(() => {
      useUserStore.getState().setVolume(1.5); // Should clamp to 1
    });
    expect(useUserStore.getState().preferences.volume).toBe(1);

    act(() => {
      useUserStore.getState().setVolume(-0.2); // Should clamp to 0
    });
    expect(useUserStore.getState().preferences.volume).toBe(0);
  });

  it('clears user profile on clearUser', () => {
    act(() => {
      useUserStore.getState().setUser({ id: '123', name: 'Test' });
    });
    expect(useUserStore.getState().user).not.toBeNull();

    act(() => {
      useUserStore.getState().clearUser();
    });
    expect(useUserStore.getState().user).toBeNull();
  });

  it('syncs from session and spotify profile', () => {
    const session = {
      user: {
        id: 'session-id',
        name: 'Session User',
        email: 'user@spotify.com',
        image: 'https://avatar.png',
      },
      spotifyId: 'spotify-123',
    };

    act(() => {
      useUserStore.getState().syncFromSession(session);
    });

    let state = useUserStore.getState();
    expect(state.user?.id).toBe('spotify-123');
    expect(state.user?.name).toBe('Session User');

    const spotifyProfile = {
      id: 'spotify-123',
      display_name: 'Spotify Display Name',
      images: [{ url: 'https://spotify-hd-avatar.png' }],
      product: 'premium',
      country: 'CA',
      followers: { total: 42 },
      external_urls: { spotify: 'https://open.spotify.com/user/spotify-123' },
    };

    act(() => {
      useUserStore.getState().syncFromSpotify(spotifyProfile as any);
    });

    state = useUserStore.getState();
    expect(state.user?.name).toBe('Spotify Display Name');
    expect(state.user?.image).toBe('https://spotify-hd-avatar.png');
    expect(state.user?.product).toBe('premium');
    expect(state.user?.country).toBe('CA');
    expect(state.user?.followersCount).toBe(42);
    expect(state.user?.spotifyUri).toBe('https://open.spotify.com/user/spotify-123');
  });

  it('fetches and syncs spotify profile via fetchAndSyncProfile', async () => {
    const mockSpotifyUser = {
      id: 'fetched-id',
      display_name: 'Fetched Name',
      images: [{ url: 'https://image.jpg' }],
      product: 'premium',
      country: 'US',
    };

    const spy = vi.spyOn(spotifyLib, 'getMe').mockResolvedValue(mockSpotifyUser as any);

    await act(async () => {
      await useUserStore.getState().fetchAndSyncProfile('test-token');
    });

    expect(spy).toHaveBeenCalledWith('test-token');
    expect(useUserStore.getState().user?.name).toBe('Fetched Name');
    expect(useUserStore.getState().user?.product).toBe('premium');
  });
});

describe('UserStoreSync component', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useUserStore.getState().reset();
    });
    vi.clearAllMocks();
  });

  it('syncs user when session is authenticated and triggers profile fetch', async () => {
    vi.spyOn(spotifyLib, 'getMe').mockResolvedValue({
      id: 'sp-1',
      display_name: 'Logged In User',
      images: [],
    } as any);

    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: {
        user: { name: 'Session Name', email: 'a@b.com' },
        accessToken: 'access-token-xyz',
      } as any,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<UserStoreSync />);

    expect(useUserStore.getState().user?.name).toBe('Session Name');
  });

  it('clears user when session is unauthenticated', () => {
    act(() => {
      useUserStore.getState().setUser({ id: 'u1', name: 'User' });
    });
    expect(useUserStore.getState().user).not.toBeNull();

    vi.mocked(nextAuthReact.useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<UserStoreSync />);

    expect(useUserStore.getState().user).toBeNull();
  });
});
