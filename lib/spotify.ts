import type {
  SpotifyArtist,
  SpotifyTrack,
  AudioFeatures,
  RecentlyPlayedItem,
  SpotifyPlaylist,
  SpotifyUser,
  TimeRange,
} from '@/types/spotify';
import { getTrackTopTags, getArtistTopTags, estimateAudioFeatures } from '@/lib/lastfm';

const BASE = 'https://api.spotify.com/v1';

export class SpotifyApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// In-memory cache for API responses with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export function clearSpotifyCache(): void {
  cache.clear();
  inFlightRequests.clear();
}

export async function spotifyFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
  ttlMs = 3 * 60 * 1000, // Default 3 min TTL for GET requests
): Promise<T> {
  const method = init?.method?.toUpperCase() ?? 'GET';
  const isGet = method === 'GET';
  const cacheKey = `${token.slice(-10)}:${path}`;

  // Check cache for GET requests
  if (isGet && ttlMs > 0) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
    // Deduplicate in-flight GET requests
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const fetchPromise = (async () => {
    let retries = 2;
    let delay = 500;

    while (retries >= 0) {
      try {
        const res = await fetch(`${BASE}${path}`, {
          ...init,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
          },
        });

        if (res.status === 429) {
          const retryAfter = Number(res.headers.get('Retry-After')) || delay / 1000;
          if (retries > 0) {
            retries--;
            await new Promise((r) => setTimeout(r, Math.max(retryAfter * 1000, delay)));
            delay *= 2;
            continue;
          }
        }

        if (!res.ok) {
          const body = await res.text();
          throw new SpotifyApiError(
            `Spotify API ${res.status} on ${path}: ${body}`,
            res.status,
          );
        }

        if (res.status === 204) return {} as T;
        const data = await res.json();

        // Store in cache
        if (isGet && ttlMs > 0) {
          cache.set(cacheKey, {
            data,
            expiresAt: Date.now() + ttlMs,
          });
        }

        return data as T;
      } catch (err) {
        if (
          retries > 0 &&
          !(err instanceof SpotifyApiError && err.status < 500 && err.status !== 429)
        ) {
          retries--;
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
    throw new Error(`Failed request to ${path}`);
  })();

  if (isGet && ttlMs > 0) {
    inFlightRequests.set(cacheKey, fetchPromise);
    fetchPromise
      .catch(() => {})
      .finally(() => {
        inFlightRequests.delete(cacheKey);
      });
  }

  return fetchPromise;
}

export const getMe = (token: string) =>
  spotifyFetch<SpotifyUser>(token, '/me', undefined, 10 * 60 * 1000);

export const getTopArtists = (
  token: string,
  timeRange: TimeRange = 'medium_term',
  limit = 20,
) =>
  spotifyFetch<{ items: SpotifyArtist[] }>(
    token,
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    undefined,
    5 * 60 * 1000,
  );

export const getTopTracks = (
  token: string,
  timeRange: TimeRange = 'medium_term',
  limit = 20,
) =>
  spotifyFetch<{ items: SpotifyTrack[] }>(
    token,
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    undefined,
    5 * 60 * 1000,
  );

export const getRecentlyPlayed = (token: string, limit = 50) =>
  spotifyFetch<{ items: RecentlyPlayedItem[] }>(
    token,
    `/me/player/recently-played?limit=${limit}`,
    undefined,
    60 * 1000, // 1 minute TTL for recent history
  );

export const getArtist = (token: string, id: string) =>
  spotifyFetch<SpotifyArtist>(token, `/artists/${id}`, undefined, 10 * 60 * 1000);

export const getTrack = (token: string, id: string) =>
  spotifyFetch<SpotifyTrack>(token, `/tracks/${id}`, undefined, 10 * 60 * 1000);

export const getSeveralTracks = (token: string, ids: string[]) => {
  if (ids.length === 0) return Promise.resolve({ tracks: [] });
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50));
  }

  return Promise.all(
    chunks.map((chunk) =>
      spotifyFetch<{ tracks: (SpotifyTrack | null)[] }>(
        token,
        `/tracks?ids=${chunk.join(',')}`,
        undefined,
        10 * 60 * 1000,
      ),
    ),
  ).then((results) => ({
    tracks: results.flatMap((r) => r.tracks).filter((t): t is SpotifyTrack => t !== null),
  }));
};

/** Auth failures must surface; only restricted/missing/network failures may fall back. */
function rethrowIfUnauthorized(err: unknown): void {
  if (err instanceof SpotifyApiError && err.status === 401) throw err;
}

export const searchTracks = (token: string, query: string, limit = 20) =>
  spotifyFetch<{ tracks: { items: SpotifyTrack[] } }>(
    token,
    `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    undefined,
    5 * 60 * 1000,
  );

export const searchTrack = async (
  token: string,
  trackName: string,
  artistName?: string,
): Promise<SpotifyTrack | null> => {
  if (!trackName) return null;
  const cleanTrack = trackName.replace(/[([].*?[)\]]/g, '').trim();
  const query = artistName ? `track:${cleanTrack} artist:${artistName}` : cleanTrack;

  try {
    const res = await searchTracks(token, query, 3);
    const item = res?.tracks?.items?.[0];
    if (item) return item;
    if (artistName) {
      const fallbackRes = await searchTracks(token, `${cleanTrack} ${artistName}`, 3);
      return fallbackRes?.tracks?.items?.[0] ?? null;
    }
    return null;
  } catch (err) {
    rethrowIfUnauthorized(err);
    return null;
  }
};

export const getAudioFeatures = async (
  token: string,
  id: string,
): Promise<AudioFeatures> => {
  try {
    const res = await spotifyFetch<AudioFeatures>(
      token,
      `/audio-features/${id}`,
      undefined,
      10 * 60 * 1000,
    );
    if (
      res &&
      (res.danceability !== undefined ||
        res.tempo !== undefined ||
        res.energy !== undefined)
    ) {
      return res;
    }
  } catch (err) {
    // Expected: 403/404 (restricted) or network errors; 401 is rethrown
    rethrowIfUnauthorized(err);
  }

  try {
    const track = await getTrack(token, id);
    const artistName = track.artists?.[0]?.name ?? '';
    const trackTags = await getTrackTopTags(artistName, track.name);
    const artistTags = trackTags.length < 3 ? await getArtistTopTags(artistName) : [];
    const allTags = [...trackTags.map((t) => t.name), ...artistTags.map((t) => t.name)];
    return estimateAudioFeatures(track, allTags);
  } catch (err) {
    rethrowIfUnauthorized(err);
    return estimateAudioFeatures({ id, name: id, artists: [{ name: '' }] }, []);
  }
};

export const getSeveralAudioFeatures = async (
  token: string,
  ids: string[],
): Promise<{ audio_features: (AudioFeatures | null)[] }> => {
  if (ids.length === 0) return Promise.resolve({ audio_features: [] });

  // 1. Attempt native Spotify audio-features endpoint
  try {
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 100) {
      chunks.push(ids.slice(i, i + 100));
    }

    const results = await Promise.all(
      chunks.map((chunk) =>
        spotifyFetch<{ audio_features: (AudioFeatures | null)[] }>(
          token,
          `/audio-features?ids=${chunk.join(',')}`,
          undefined,
          10 * 60 * 1000,
        ),
      ),
    );
    const all = results.flatMap((r) => r.audio_features);
    const validCount = all.filter(
      (f) => f !== null && f?.danceability !== undefined,
    ).length;
    if (validCount > 0) {
      return { audio_features: all };
    }
  } catch (err) {
    // Expected: 403/404 (restricted) or network errors; 401 is rethrown
    rethrowIfUnauthorized(err);
  }

  // 2. Fallback: retrieve track metadata and compute acoustic DNA from Last.fm tags
  try {
    const tracksRes = await getSeveralTracks(token, ids);
    const trackMap = new Map(tracksRes.tracks.map((t) => [t.id, t]));

    const featuresList = await Promise.all(
      ids.map(async (id) => {
        const track = trackMap.get(id);
        if (!track) {
          return estimateAudioFeatures({ id, name: id, artists: [{ name: '' }] }, []);
        }
        try {
          const artistName = track.artists?.[0]?.name ?? '';
          const artistTags = await getArtistTopTags(artistName);
          const tags = artistTags.map((t) => t.name);
          return estimateAudioFeatures(track, tags);
        } catch {
          return estimateAudioFeatures(track, []);
        }
      }),
    );

    return { audio_features: featuresList };
  } catch (err) {
    rethrowIfUnauthorized(err);
    const defaultFeatures = ids.map((id) =>
      estimateAudioFeatures({ id, name: id, artists: [{ name: '' }] }, []),
    );
    return { audio_features: defaultFeatures };
  }
};

export const getUserPlaylists = (token: string, limit = 50) =>
  spotifyFetch<{ items: SpotifyPlaylist[] }>(
    token,
    `/me/playlists?limit=${limit}`,
    undefined,
    3 * 60 * 1000,
  );

export const getPlaylistTracks = async (
  token: string,
  playlistId: string,
  limit = 50,
): Promise<{ items: { track: SpotifyTrack }[] }> => {
  try {
    return await spotifyFetch<{ items: { track: SpotifyTrack }[] }>(
      token,
      `/playlists/${playlistId}/tracks?limit=${limit}`,
      undefined,
      3 * 60 * 1000,
    );
  } catch (err) {
    if (err instanceof SpotifyApiError && (err.status === 403 || err.status === 404)) {
      try {
        const full = await spotifyFetch<{
          tracks?: { items: { track: SpotifyTrack }[] };
        }>(token, `/playlists/${playlistId}`, undefined, 3 * 60 * 1000);
        if (full?.tracks?.items) {
          return { items: full.tracks.items };
        }
      } catch (fullErr) {
        // Only treat 403/404 as a restricted playlist; surface 401, 429 and 5xx
        if (
          fullErr instanceof SpotifyApiError &&
          (fullErr.status === 403 || fullErr.status === 404)
        ) {
          return { items: [] };
        }
        throw fullErr;
      }
      return { items: [] };
    }
    throw err;
  }
};

export const createPlaylist = (
  token: string,
  userId: string,
  name: string,
  description: string,
  isPublic: boolean,
): Promise<SpotifyPlaylist> =>
  spotifyFetch<SpotifyPlaylist>(token, `/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({ name, description, public: isPublic }),
  });

export const addTracksToPlaylist = (token: string, playlistId: string, uris: string[]) =>
  spotifyFetch<{ snapshot_id: string }>(token, `/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({ uris }),
  });

export const createPlaylistWithTracks = async (
  token: string,
  userId: string,
  name: string,
  description: string,
  uris: string[],
  isPublic = false,
): Promise<SpotifyPlaylist> => {
  const playlist = await createPlaylist(token, userId, name, description, isPublic);
  if (uris.length > 0) {
    for (let i = 0; i < uris.length; i += 100) {
      await addTracksToPlaylist(token, playlist.id, uris.slice(i, i + 100));
    }
  }
  return playlist;
};

export const getAvailableGenreSeeds = async (
  token: string,
): Promise<{ genres: string[] }> => {
  try {
    const res = await spotifyFetch<{ genres: string[] }>(
      token,
      '/recommendations/available-genre-seeds',
      undefined,
      60 * 60 * 1000,
    );
    if (res?.genres?.length) return res;
  } catch {
    // Fall back to standard genre catalog
  }

  return {
    genres: [
      'acoustic',
      'alternative',
      'ambient',
      'blues',
      'classical',
      'country',
      'dance',
      'disco',
      'electronic',
      'folk',
      'funk',
      'hip-hop',
      'house',
      'indie',
      'jazz',
      'latin',
      'metal',
      'pop',
      'punk',
      'r&b',
      'reggae',
      'rock',
      'soul',
      'synthpop',
      'techno',
    ],
  };
};

export {
  getRecommendations,
  getRecommendationsFromLastFm,
} from '@/lib/spotify-recommendations';
