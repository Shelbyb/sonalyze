import { fetchWithRetry } from '@/lib/fetch-retry';

export interface LastFmTrack {
  name: string;
  artist: string;
  match?: number;
  playcount?: number;
  duration?: number;
  url?: string;
}

export interface LastFmArtist {
  name: string;
  match?: number;
  url?: string;
}

export interface LastFmTag {
  name: string;
  count: number;
}

const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';
// Default public developer key with fallback
const DEFAULT_KEY = 'c1356bf5b5d84d0bcf3f990a42aa5c02';

function getApiKey(): string {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env.LASTFM_API_KEY || process.env.NEXT_PUBLIC_LASTFM_API_KEY || DEFAULT_KEY
    );
  }
  return DEFAULT_KEY;
}

// In-memory cache for Last.fm responses (15-min TTL)
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function clearLastFmCache(): void {
  cache.clear();
}

async function lastFmFetch<T>(
  params: Record<string, string>,
  ttlMs = 15 * 60 * 1000,
): Promise<T | null> {
  const apiKey = getApiKey();
  const searchParams = new URLSearchParams({
    ...params,
    api_key: apiKey,
    format: 'json',
  });

  const cacheKey = searchParams.toString();
  if (ttlMs > 0) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
  }

  try {
    const res = await fetchWithRetry(`${LASTFM_BASE}?${searchParams.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as T;
    if (ttlMs > 0) {
      cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Get tracks similar to a given track and artist
 */
export async function getSimilarTracks(
  artist: string,
  track: string,
  limit = 25,
): Promise<LastFmTrack[]> {
  if (!artist || !track) return [];
  const res = await lastFmFetch<{
    similartracks?: {
      track?:
        | Array<{
            name?: string;
            match?: number | string;
            playcount?: number | string;
            duration?: number | string;
            url?: string;
            artist?: { name?: string };
          }>
        | {
            name?: string;
            match?: number | string;
            playcount?: number | string;
            duration?: number | string;
            url?: string;
            artist?: { name?: string };
          };
    };
  }>({
    method: 'track.getsimilar',
    artist: artist.trim(),
    track: track.trim(),
    limit: String(limit),
  });

  const rawList = res?.similartracks?.track;
  if (!rawList) return [];
  const items = Array.isArray(rawList) ? rawList : [rawList];

  const tracks: LastFmTrack[] = [];
  for (const item of items) {
    const name = item.name?.trim() ?? '';
    const artistName = item.artist?.name?.trim() ?? '';
    if (name && artistName) {
      tracks.push({
        name,
        artist: artistName,
        match: typeof item.match === 'string' ? parseFloat(item.match) : item.match,
        playcount:
          typeof item.playcount === 'string'
            ? parseInt(item.playcount, 10)
            : item.playcount,
        duration:
          typeof item.duration === 'string' ? parseInt(item.duration, 10) : item.duration,
        url: item.url,
      });
    }
  }
  return tracks;
}

/**
 * Get artists similar to a given artist
 */
export async function getSimilarArtists(
  artist: string,
  limit = 10,
): Promise<LastFmArtist[]> {
  if (!artist) return [];
  const res = await lastFmFetch<{
    similarartists?: {
      artist?:
        | Array<{
            name?: string;
            match?: number | string;
            url?: string;
          }>
        | {
            name?: string;
            match?: number | string;
            url?: string;
          };
    };
  }>({
    method: 'artist.getsimilar',
    artist: artist.trim(),
    limit: String(limit),
  });

  const rawList = res?.similarartists?.artist;
  if (!rawList) return [];
  const items = Array.isArray(rawList) ? rawList : [rawList];

  const artists: LastFmArtist[] = [];
  for (const item of items) {
    const name = item.name?.trim() ?? '';
    if (name) {
      artists.push({
        name,
        match: typeof item.match === 'string' ? parseFloat(item.match) : item.match,
        url: item.url,
      });
    }
  }
  return artists;
}

/**
 * Get top tracks for an artist
 */
export async function getArtistTopTracks(
  artist: string,
  limit = 10,
): Promise<LastFmTrack[]> {
  if (!artist) return [];
  const res = await lastFmFetch<{
    toptracks?: {
      track?:
        | Array<{
            name?: string;
            playcount?: number | string;
            url?: string;
            artist?: { name?: string };
          }>
        | {
            name?: string;
            playcount?: number | string;
            url?: string;
            artist?: { name?: string };
          };
    };
  }>({
    method: 'artist.gettoptracks',
    artist: artist.trim(),
    limit: String(limit),
  });

  const rawList = res?.toptracks?.track;
  if (!rawList) return [];
  const items = Array.isArray(rawList) ? rawList : [rawList];

  const tracks: LastFmTrack[] = [];
  for (const item of items) {
    const name = item.name?.trim() ?? '';
    const artistName = item.artist?.name?.trim() || artist.trim();
    if (name) {
      tracks.push({
        name,
        artist: artistName,
        playcount:
          typeof item.playcount === 'string'
            ? parseInt(item.playcount, 10)
            : item.playcount,
        url: item.url,
      });
    }
  }
  return tracks;
}

/**
 * Get top tracks for a genre/tag
 */
export async function getTagTopTracks(tag: string, limit = 25): Promise<LastFmTrack[]> {
  if (!tag) return [];
  const res = await lastFmFetch<{
    tracks?: {
      track?:
        | Array<{
            name?: string;
            url?: string;
            artist?: { name?: string };
          }>
        | {
            name?: string;
            url?: string;
            artist?: { name?: string };
          };
    };
  }>({
    method: 'tag.gettoptracks',
    tag: tag.trim().toLowerCase(),
    limit: String(limit),
  });

  const rawList = res?.tracks?.track;
  if (!rawList) return [];
  const items = Array.isArray(rawList) ? rawList : [rawList];

  const tracks: LastFmTrack[] = [];
  for (const item of items) {
    const name = item.name?.trim() ?? '';
    const artistName = item.artist?.name?.trim() ?? '';
    if (name && artistName) {
      tracks.push({
        name,
        artist: artistName,
        url: item.url,
      });
    }
  }
  return tracks;
}

/**
 * Get top tags for a track
 */
export async function getTrackTopTags(
  artist: string,
  track: string,
): Promise<LastFmTag[]> {
  if (!artist || !track) return [];
  const res = await lastFmFetch<{
    toptags?: {
      tag?:
        | Array<{ name?: string; count?: number | string }>
        | { name?: string; count?: number | string };
    };
  }>({
    method: 'track.gettoptags',
    artist: artist.trim(),
    track: track.trim(),
  });

  const rawTags = res?.toptags?.tag;
  if (!rawTags) return [];
  const items = Array.isArray(rawTags) ? rawTags : [rawTags];

  return items
    .map((t) => ({
      name: (t.name ?? '').toLowerCase().trim(),
      count: typeof t.count === 'string' ? parseInt(t.count, 10) : (t.count ?? 0),
    }))
    .filter((t) => Boolean(t.name));
}

/**
 * Get top tags for an artist
 */
export async function getArtistTopTags(artist: string): Promise<LastFmTag[]> {
  if (!artist) return [];
  const res = await lastFmFetch<{
    toptags?: {
      tag?:
        | Array<{ name?: string; count?: number | string }>
        | { name?: string; count?: number | string };
    };
  }>({
    method: 'artist.gettoptags',
    artist: artist.trim(),
  });

  const rawTags = res?.toptags?.tag;
  if (!rawTags) return [];
  const items = Array.isArray(rawTags) ? rawTags : [rawTags];

  return items
    .map((t) => ({
      name: (t.name ?? '').toLowerCase().trim(),
      count: typeof t.count === 'string' ? parseInt(t.count, 10) : (t.count ?? 0),
    }))
    .filter((t) => Boolean(t.name));
}

export { estimateAudioFeatures } from '@/lib/lastfm-acoustics';
