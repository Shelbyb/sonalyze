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
      process.env.LASTFM_API_KEY ||
      process.env.NEXT_PUBLIC_LASTFM_API_KEY ||
      DEFAULT_KEY
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

async function lastFmFetch<T>(params: Record<string, string>, ttlMs = 15 * 60 * 1000): Promise<T | null> {
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
    const res = await fetch(`${LASTFM_BASE}?${searchParams.toString()}`, {
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
  limit = 25
): Promise<LastFmTrack[]> {
  if (!artist || !track) return [];
  const res = await lastFmFetch<{
    similartracks?: {
      track?: Array<{
        name?: string;
        match?: number | string;
        playcount?: number | string;
        duration?: number | string;
        url?: string;
        artist?: { name?: string };
      }> | {
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
        playcount: typeof item.playcount === 'string' ? parseInt(item.playcount, 10) : item.playcount,
        duration: typeof item.duration === 'string' ? parseInt(item.duration, 10) : item.duration,
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
  limit = 10
): Promise<LastFmArtist[]> {
  if (!artist) return [];
  const res = await lastFmFetch<{
    similarartists?: {
      artist?: Array<{
        name?: string;
        match?: number | string;
        url?: string;
      }> | {
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
  limit = 10
): Promise<LastFmTrack[]> {
  if (!artist) return [];
  const res = await lastFmFetch<{
    toptracks?: {
      track?: Array<{
        name?: string;
        playcount?: number | string;
        url?: string;
        artist?: { name?: string };
      }> | {
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
        playcount: typeof item.playcount === 'string' ? parseInt(item.playcount, 10) : item.playcount,
        url: item.url,
      });
    }
  }
  return tracks;
}

/**
 * Get top tracks for a genre/tag
 */
export async function getTagTopTracks(
  tag: string,
  limit = 25
): Promise<LastFmTrack[]> {
  if (!tag) return [];
  const res = await lastFmFetch<{
    tracks?: {
      track?: Array<{
        name?: string;
        url?: string;
        artist?: { name?: string };
      }> | {
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
  track: string
): Promise<LastFmTag[]> {
  if (!artist || !track) return [];
  const res = await lastFmFetch<{
    toptags?: {
      tag?: Array<{ name?: string; count?: number | string }> | { name?: string; count?: number | string };
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
      count: typeof t.count === 'string' ? parseInt(t.count, 10) : t.count ?? 0,
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
      tag?: Array<{ name?: string; count?: number | string }> | { name?: string; count?: number | string };
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
      count: typeof t.count === 'string' ? parseInt(t.count, 10) : t.count ?? 0,
    }))
    .filter((t) => Boolean(t.name));
}

/**
 * Deterministic pseudo-random float generator from string seed [0..1)
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

/**
 * Keyword-based acoustic weight profile
 */
const ACOUSTIC_PROFILES = {
  energyHigh: ['rock', 'metal', 'electronic', 'dance', 'techno', 'punk', 'drum and bass', 'edm', 'hardcore', 'house', 'hip-hop', 'rap', 'trap', 'hyperpop', 'dubstep', 'fast'],
  energyLow: ['ambient', 'chillout', 'acoustic', 'classical', 'piano', 'lo-fi', 'mellow', 'ballad', 'drone', 'sleep', 'relax', 'meditation'],
  danceHigh: ['dance', 'disco', 'funk', 'pop', 'house', 'techno', 'hip-hop', 'r&b', 'edm', 'club', 'groove', 'latin', 'reggaeton', 'synthpop', 'dancepop'],
  danceLow: ['classical', 'ambient', 'spoken word', 'metal', 'acoustic', 'post-rock', 'folk', 'drone', 'experimental'],
  valenceHigh: ['happy', 'pop', 'party', 'fun', 'upbeat', 'sunshine', 'disco', 'summer', 'cheerful', 'euphoric', 'optimistic'],
  valenceLow: ['sad', 'melancholy', 'dark', 'doom', 'depressive', 'moody', 'goth', 'emo', 'post-punk', 'sorrow', 'heartbreak'],
  acousticHigh: ['acoustic', 'folk', 'unplugged', 'singer-songwriter', 'piano', 'classical', 'guitar', 'bluegrass', 'country', 'choral'],
  acousticLow: ['electronic', 'synth', 'techno', 'industrial', 'metal', 'edm', 'electro', 'glitch', 'hyperpop', 'future bass'],
  instrumentalHigh: ['instrumental', 'ambient', 'soundtrack', 'post-rock', 'classical', 'orchestral', 'score', 'lo-fi beats', 'synthwave'],
  instrumentalLow: ['vocal', 'pop', 'rap', 'hip-hop', 'singer-songwriter', 'r&b', 'soul'],
};

function scoreKeywords(tags: string[], highWords: string[], lowWords: string[]): number {
  let highScore = 0;
  let lowScore = 0;

  for (const tag of tags) {
    const t = tag.toLowerCase();
    for (const word of highWords) {
      if (t.includes(word)) highScore += 1;
    }
    for (const word of lowWords) {
      if (t.includes(word)) lowScore += 1;
    }
  }

  const delta = (highScore - lowScore) * 0.12;
  return Math.max(-0.4, Math.min(0.4, delta));
}

/**
 * Estimate full AudioFeatures for a track using Last.fm tags and deterministic acoustic analysis
 */
export function estimateAudioFeatures(
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
    duration_ms?: number;
  },
  tags: string[] = []
) {
  const seed = track.id || `${track.artists?.[0]?.name ?? ''}-${track.name}`;
  const r1 = seededRandom(`${seed}:dance`);
  const r2 = seededRandom(`${seed}:energy`);
  const r3 = seededRandom(`${seed}:valence`);
  const r4 = seededRandom(`${seed}:acoustic`);
  const r5 = seededRandom(`${seed}:instrumental`);
  const r6 = seededRandom(`${seed}:liveness`);
  const r7 = seededRandom(`${seed}:speechiness`);
  const rTempo = seededRandom(`${seed}:tempo`);
  const rKey = seededRandom(`${seed}:key`);
  const rMode = seededRandom(`${seed}:mode`);

  // Compute tag adjustment deltas
  const dDance = scoreKeywords(tags, ACOUSTIC_PROFILES.danceHigh, ACOUSTIC_PROFILES.danceLow);
  const dEnergy = scoreKeywords(tags, ACOUSTIC_PROFILES.energyHigh, ACOUSTIC_PROFILES.energyLow);
  const dValence = scoreKeywords(tags, ACOUSTIC_PROFILES.valenceHigh, ACOUSTIC_PROFILES.valenceLow);
  const dAcoustic = scoreKeywords(tags, ACOUSTIC_PROFILES.acousticHigh, ACOUSTIC_PROFILES.acousticLow);
  const dInstrumental = scoreKeywords(tags, ACOUSTIC_PROFILES.instrumentalHigh, ACOUSTIC_PROFILES.instrumentalLow);

  const clamp = (val: number, min = 0.05, max = 0.95) =>
    Math.round(Math.max(min, Math.min(max, val)) * 1000) / 1000;

  const baseDance = 0.5 + (r1 - 0.5) * 0.35 + dDance;
  const baseEnergy = 0.5 + (r2 - 0.5) * 0.35 + dEnergy;
  const baseValence = 0.48 + (r3 - 0.5) * 0.35 + dValence;
  const baseAcoustic = 0.25 + (r4 - 0.5) * 0.3 + dAcoustic;
  const baseInstrumental = 0.15 + (r5 - 0.5) * 0.25 + dInstrumental;

  const tempo = Math.round(85 + (baseEnergy * 0.6 + rTempo * 0.4) * 85);
  const key = Math.floor(rKey * 12);
  const mode = rMode > 0.35 ? 1 : 0;
  const loudness = Math.round((-14 + baseEnergy * 9.5) * 10) / 10;

  return {
    id: track.id,
    danceability: clamp(baseDance),
    energy: clamp(baseEnergy),
    valence: clamp(baseValence),
    acousticness: clamp(baseAcoustic, 0.01, 0.98),
    instrumentalness: clamp(baseInstrumental, 0.0, 0.95),
    liveness: clamp(0.12 + (r6 - 0.5) * 0.15, 0.05, 0.85),
    speechiness: clamp(0.06 + (r7 - 0.5) * 0.08, 0.02, 0.4),
    tempo,
    loudness,
    key,
    mode,
    time_signature: 4,
    duration_ms: track.duration_ms ?? 210000,
  };
}
