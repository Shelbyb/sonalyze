import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  clearLastFmCache,
  getSimilarTracks,
  getSimilarArtists,
  getArtistTopTracks,
  getTagTopTracks,
  getTrackTopTags,
  getArtistTopTags,
  estimateAudioFeatures,
} from '@/lib/lastfm';

describe('Last.fm Client & Acoustic Intelligence', () => {
  beforeEach(() => {
    clearLastFmCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches similar tracks for a track and artist', async () => {
    const mockResponse = {
      similartracks: {
        track: [
          {
            name: 'Paranoid Android',
            artist: { name: 'Radiohead' },
            match: 0.98,
            playcount: 500000,
            duration: 387,
          },
          {
            name: 'Knights of Cydonia',
            artist: { name: 'Muse' },
            match: 0.85,
            playcount: 450000,
            duration: 366,
          },
        ],
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const tracks = await getSimilarTracks('Radiohead', 'Karma Police', 5);
    expect(tracks.length).toBe(2);
    expect(tracks[0].name).toBe('Paranoid Android');
    expect(tracks[0].artist).toBe('Radiohead');
    expect(tracks[0].match).toBe(0.98);
    expect(tracks[1].artist).toBe('Muse');
  });

  it('fetches similar artists and artist top tracks', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('artist.getsimilar')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            similarartists: {
              artist: [{ name: 'Thom Yorke', match: 0.9 }],
            },
          }),
        });
      }
      if (url.includes('artist.gettoptracks')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            toptracks: {
              track: [{ name: 'Eraser', artist: { name: 'Thom Yorke' } }],
            },
          }),
        });
      }
      return Promise.reject(new Error('Unknown'));
    });

    const artists = await getSimilarArtists('Radiohead', 2);
    expect(artists[0].name).toBe('Thom Yorke');

    const topTracks = await getArtistTopTracks('Thom Yorke', 2);
    expect(topTracks[0].name).toBe('Eraser');
  });

  it('fetches genre/tag top tracks and track tags', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('tag.gettoptracks')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            tracks: {
              track: [{ name: 'Strobe', artist: { name: 'deadmau5' } }],
            },
          }),
        });
      }
      if (url.includes('track.gettoptags')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            toptags: {
              tag: [
                { name: 'electronic', count: 100 },
                { name: 'progressive house', count: 80 },
              ],
            },
          }),
        });
      }
      if (url.includes('artist.gettoptags')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            toptags: {
              tag: [{ name: 'edm', count: 100 }],
            },
          }),
        });
      }
      return Promise.reject(new Error('Unknown'));
    });

    const genreTracks = await getTagTopTracks('electronic', 5);
    expect(genreTracks[0].name).toBe('Strobe');

    const trackTags = await getTrackTopTags('deadmau5', 'Strobe');
    expect(trackTags[0].name).toBe('electronic');

    const artistTags = await getArtistTopTags('deadmau5');
    expect(artistTags[0].name).toBe('edm');
  });

  it('estimates deterministic audio features using Last.fm acoustic profiles', () => {
    const danceTrack = {
      id: 'dance123',
      name: 'Around The World',
      artists: [{ name: 'Daft Punk' }],
      duration_ms: 240000,
    };
    const danceFeatures = estimateAudioFeatures(danceTrack, [
      'dance',
      'electronic',
      'house',
      'disco',
      'party',
    ]);

    expect(danceFeatures.id).toBe('dance123');
    expect(danceFeatures.danceability).toBeGreaterThan(0.6);
    expect(danceFeatures.energy).toBeGreaterThan(0.6);
    expect(danceFeatures.tempo).toBeGreaterThan(110);
    expect(danceFeatures.duration_ms).toBe(240000);

    // Acoustic track
    const acousticTrack = {
      id: 'acoustic123',
      name: 'Blackbird',
      artists: [{ name: 'The Beatles' }],
      duration_ms: 140000,
    };
    const acousticFeatures = estimateAudioFeatures(acousticTrack, [
      'acoustic',
      'folk',
      'guitar',
      'unplugged',
    ]);

    expect(acousticFeatures.id).toBe('acoustic123');
    expect(acousticFeatures.acousticness).toBeGreaterThan(0.5);
    expect(acousticFeatures.energy).toBeLessThan(0.6);
  });
});
