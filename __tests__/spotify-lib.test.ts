import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

vi.mock('@/lib/daywalker-auth', () => ({
  requireServiceAuth: vi.fn().mockResolvedValue(undefined),
  validateServiceToken: vi.fn().mockResolvedValue({ valid: true, status: 200 }),
  clearServiceAuthCache: vi.fn(),
}));

import {
  clearSpotifyCache,
  getMe,
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  getTrack,
  getAudioFeatures,
  getSeveralAudioFeatures,
  getUserPlaylists,
  getPlaylistTracks,
  getRecommendations,
  createPlaylist,
  addTracksToPlaylist,
  createPlaylistWithTracks,
  getAvailableGenreSeeds,
  SpotifyApiError,
} from '@/lib/spotify';

describe('Spotify API Client & Cache Layer', () => {
  beforeEach(() => {
    clearSpotifyCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches user profile successfully with caching', async () => {
    const mockUser = {
      id: 'user123',
      display_name: 'Alex Johnson',
      images: [{ url: 'https://example.com/avatar.jpg' }],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockUser,
    });
    global.fetch = fetchMock;

    const res1 = await getMe('test-token');
    expect(res1.display_name).toBe('Alex Johnson');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Second call should return cached data without additional fetch
    const res2 = await getMe('test-token');
    expect(res2.display_name).toBe('Alex Johnson');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('handles and throws SpotifyApiError on HTTP error status', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        text: async () => 'Forbidden: Extended API access required',
      })
    );

    let error: any;
    try {
      await getTrack('test-token', 'track123');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SpotifyApiError);
    expect(error.status).toBe(403);
  });

  it('fetches top artists and top tracks with custom time ranges', async () => {
    const mockArtists = { items: [{ id: 'a1', name: 'Radiohead' }] };
    const mockTracks = { items: [{ id: 't1', name: 'Karma Police' }] };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/me/top/artists')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockArtists,
        });
      }
      if (url.includes('/me/top/tracks')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockTracks,
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const artists = await getTopArtists('token-abc', 'short_term', 10);
    expect(artists.items[0].name).toBe('Radiohead');

    const tracks = await getTopTracks('token-abc', 'long_term', 5);
    expect(tracks.items[0].name).toBe('Karma Police');
  });

  it('fetches and chunks several audio features properly', async () => {
    const mockFeatures = {
      audio_features: [
        { id: 't1', danceability: 0.8, energy: 0.9 },
        { id: 't2', danceability: 0.5, energy: 0.4 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockFeatures,
    });

    const result = await getSeveralAudioFeatures('token-abc', ['t1', 't2']);
    expect(result.audio_features.length).toBe(2);

    // Empty list should resolve immediately without network call
    const emptyResult = await getSeveralAudioFeatures('token-abc', []);
    expect(emptyResult.audio_features).toEqual([]);
  });

  it('creates playlist and adds tracks in one workflow', async () => {
    const mockPlaylist = {
      id: 'p123',
      name: 'My New Playlist',
      external_urls: { spotify: 'https://open.spotify.com/playlist/p123' },
    };

    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST' && url.includes('/playlists')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockPlaylist,
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ snapshot_id: 'snap1' }),
      });
    });
    global.fetch = fetchMock;

    const playlist = await createPlaylistWithTracks(
      'token-abc',
      'user-1',
      'My New Playlist',
      'Test description',
      ['spotify:track:t1', 'spotify:track:t2']
    );

    expect(playlist.id).toBe('p123');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retrieves recently played, playlists, and recommendations', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/recently-played')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ items: [{ played_at: '2026-10-09T10:00:00Z', track: { id: 't1' } }] }),
        });
      }
      if (url.includes('/recommendations/available-genre-seeds')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ genres: ['indie', 'electronic', 'rock'] }),
        });
      }
      if (url.includes('/recommendations')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ tracks: [{ id: 'rec1', name: 'Discovery' }] }),
        });
      }
      if (url.includes('/me/playlists')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ items: [{ id: 'pl1', name: 'Favorites' }] }),
        });
      }
      if (url.includes('/tracks/track999')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: 'track999', name: 'Single Track' }),
        });
      }
      if (url.includes('/audio-features/track999')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: 'track999', tempo: 120, key: 0, mode: 1 }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ items: [] }),
      });
    });

    const recent = await getRecentlyPlayed('token');
    expect(recent.items.length).toBe(1);

    const genres = await getAvailableGenreSeeds('token');
    expect(genres.genres).toContain('indie');

    const recs = await getRecommendations('token', {
      seedTracks: ['t1'],
      targetEnergy: 0.7,
      targetDanceability: 0.8,
    });
    expect(recs.tracks[0].name).toBe('Discovery');

    const pls = await getUserPlaylists('token');
    expect(pls.items[0].name).toBe('Favorites');

    const singleTrack = await getTrack('token', 'track999');
    expect(singleTrack.name).toBe('Single Track');

    const singleFeatures = await getAudioFeatures('token', 'track999');
    expect(singleFeatures.tempo).toBe(120);
  });
});
