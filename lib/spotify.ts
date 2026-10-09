import type {
  SpotifyArtist,
  SpotifyTrack,
  AudioFeatures,
  RecentlyPlayedItem,
  SpotifyPlaylist,
  SpotifyUser,
  TimeRange,
} from '@/types/spotify';
import { requireServiceAuth } from '@/lib/daywalker-auth';

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

async function spotifyFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
  ttlMs = 3 * 60 * 1000 // Default 3 min TTL for GET requests
): Promise<T> {
  await requireServiceAuth();
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
          const retryAfter = Number(res.headers.get('Retry-After')) || (delay / 1000);
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
            res.status
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
        if (retries > 0 && !(err instanceof SpotifyApiError && err.status < 500 && err.status !== 429)) {
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

export const getTopArtists = (token: string, timeRange: TimeRange = 'medium_term', limit = 20) =>
  spotifyFetch<{ items: SpotifyArtist[] }>(
    token,
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    undefined,
    5 * 60 * 1000
  );

export const getTopTracks = (token: string, timeRange: TimeRange = 'medium_term', limit = 20) =>
  spotifyFetch<{ items: SpotifyTrack[] }>(
    token,
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    undefined,
    5 * 60 * 1000
  );

export const getRecentlyPlayed = (token: string, limit = 50) =>
  spotifyFetch<{ items: RecentlyPlayedItem[] }>(
    token,
    `/me/player/recently-played?limit=${limit}`,
    undefined,
    60 * 1000 // 1 minute TTL for recent history
  );

export const getTrack = (token: string, id: string) =>
  spotifyFetch<SpotifyTrack>(token, `/tracks/${id}`, undefined, 10 * 60 * 1000);

export const getAudioFeatures = (token: string, id: string) =>
  spotifyFetch<AudioFeatures>(token, `/audio-features/${id}`, undefined, 10 * 60 * 1000);

export const getSeveralAudioFeatures = (token: string, ids: string[]) => {
  if (ids.length === 0) return Promise.resolve({ audio_features: [] });
  // Chunk in batches of 100 as per Spotify API spec
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 100) {
    chunks.push(ids.slice(i, i + 100));
  }

  return Promise.all(
    chunks.map((chunk) =>
      spotifyFetch<{ audio_features: (AudioFeatures | null)[] }>(
        token,
        `/audio-features?ids=${chunk.join(',')}`,
        undefined,
        10 * 60 * 1000
      )
    )
  ).then((results) => ({
    audio_features: results.flatMap((r) => r.audio_features),
  }));
};

export const getUserPlaylists = (token: string, limit = 50) =>
  spotifyFetch<{ items: SpotifyPlaylist[] }>(
    token,
    `/me/playlists?limit=${limit}`,
    undefined,
    3 * 60 * 1000
  );

export const getPlaylistTracks = (token: string, playlistId: string, limit = 50) =>
  spotifyFetch<{ items: { track: SpotifyTrack }[] }>(
    token,
    `/playlists/${playlistId}/tracks?limit=${limit}&fields=items(track(id,name,artists,album,duration_ms,popularity,preview_url,external_urls,explicit))`,
    undefined,
    3 * 60 * 1000
  );

export const getRecommendations = (
  token: string,
  params: {
    seedTracks?: string[];
    seedArtists?: string[];
    seedGenres?: string[];
    targetEnergy?: number;
    targetValence?: number;
    targetDanceability?: number;
    limit?: number;
  }
) => {
  const qs = new URLSearchParams();
  if (params.seedTracks?.length) qs.set('seed_tracks', params.seedTracks.slice(0, 5).join(','));
  if (params.seedArtists?.length) qs.set('seed_artists', params.seedArtists.slice(0, 5).join(','));
  if (params.seedGenres?.length) qs.set('seed_genres', params.seedGenres.slice(0, 5).join(','));
  if (params.targetEnergy !== undefined) qs.set('target_energy', String(params.targetEnergy));
  if (params.targetValence !== undefined) qs.set('target_valence', String(params.targetValence));
  if (params.targetDanceability !== undefined)
    qs.set('target_danceability', String(params.targetDanceability));
  qs.set('limit', String(params.limit ?? 20));

  return spotifyFetch<{ tracks: SpotifyTrack[] }>(
    token,
    `/recommendations?${qs.toString()}`,
    undefined,
    60 * 1000
  );
};

export const createPlaylist = (
  token: string,
  userId: string,
  name: string,
  description: string,
  isPublic: boolean
) =>
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
  isPublic = false
): Promise<SpotifyPlaylist> => {
  const playlist = await createPlaylist(token, userId, name, description, isPublic);
  if (uris.length > 0) {
    // Add tracks in batches of 100
    for (let i = 0; i < uris.length; i += 100) {
      await addTracksToPlaylist(token, playlist.id, uris.slice(i, i + 100));
    }
  }
  return playlist;
};

export const getAvailableGenreSeeds = (token: string) =>
  spotifyFetch<{ genres: string[] }>(
    token,
    '/recommendations/available-genre-seeds',
    undefined,
    60 * 60 * 1000
  );
