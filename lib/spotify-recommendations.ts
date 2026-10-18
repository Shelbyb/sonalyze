import type { SpotifyTrack } from '@/types/spotify';
import {
  getSimilarTracks,
  getSimilarArtists,
  getArtistTopTracks,
  getTagTopTracks,
} from '@/lib/lastfm';
import { spotifyFetch, getArtist, searchTrack, getSeveralTracks } from '@/lib/spotify';

export async function getRecommendationsFromLastFm(
  token: string,
  params: {
    seedTracks?: string[];
    seedArtists?: string[];
    seedGenres?: string[];
    seedTrackObjects?: { name: string; artist: string }[];
    targetEnergy?: number;
    targetValence?: number;
    targetDanceability?: number;
    limit?: number;
  },
): Promise<{ tracks: SpotifyTrack[] }> {
  const limit = params.limit ?? 20;
  const seedTrackObjs: { name: string; artist: string }[] = params.seedTrackObjects
    ? [...params.seedTrackObjects]
    : [];

  // If seedTrackObjects not provided, resolve from seedTracks IDs
  if (seedTrackObjs.length === 0 && params.seedTracks?.length) {
    try {
      const { tracks } = await getSeveralTracks(token, params.seedTracks.slice(0, 5));
      for (const t of tracks) {
        if (t?.name) {
          seedTrackObjs.push({
            name: t.name,
            artist: t.artists?.[0]?.name ?? '',
          });
        }
      }
    } catch {
      // Ignore resolution errors
    }
  }

  // Collect candidate track titles & artists from Last.fm
  const candidateMap = new Map<string, { name: string; artist: string; score: number }>();
  const addCandidate = (name: string, artist: string, score: number) => {
    if (!name || !artist) return;
    const key = `${name.toLowerCase()}:::${artist.toLowerCase()}`;
    const isSeed = seedTrackObjs.some(
      (s) =>
        s.name.toLowerCase() === name.toLowerCase() &&
        s.artist.toLowerCase() === artist.toLowerCase(),
    );
    if (isSeed) return;

    const existing = candidateMap.get(key);
    if (!existing || existing.score < score) {
      candidateMap.set(key, { name, artist, score });
    }
  };

  // 1. Query similar tracks for each seed track
  await Promise.all(
    seedTrackObjs.map(async (seed) => {
      try {
        const similars = await getSimilarTracks(seed.artist, seed.name, 30);
        similars.forEach((sim, idx) => {
          const matchScore = typeof sim.match === 'number' ? sim.match : 1 - idx * 0.03;
          addCandidate(sim.name, sim.artist, matchScore);
        });
      } catch {
        // Continue with other seeds
      }
    }),
  );

  // 2. Query similar artists and top tracks
  if (params.seedArtists?.length) {
    await Promise.all(
      params.seedArtists.slice(0, 3).map(async (artistId) => {
        try {
          const artist = await getArtist(token, artistId);
          if (artist?.name) {
            const similarArtists = await getSimilarArtists(artist.name, 6);
            await Promise.all(
              similarArtists.map(async (sa) => {
                const top = await getArtistTopTracks(sa.name, 4);
                top.forEach((t) => addCandidate(t.name, t.artist, 0.75));
              }),
            );
          }
        } catch {
          // Ignore
        }
      }),
    );
  }

  // 3. Query genre top tracks if seedGenres provided
  if (params.seedGenres?.length) {
    await Promise.all(
      params.seedGenres.slice(0, 3).map(async (genre) => {
        try {
          const top = await getTagTopTracks(genre, 20);
          top.forEach((t) => addCandidate(t.name, t.artist, 0.65));
        } catch {
          // Ignore
        }
      }),
    );
  }

  // If still low candidates, query artist top tracks for seed tracks' artists
  if (candidateMap.size < limit) {
    await Promise.all(
      seedTrackObjs.map(async (seed) => {
        if (!seed.artist) return;
        try {
          const top = await getArtistTopTracks(seed.artist, 6);
          top.forEach((t) => addCandidate(t.name, t.artist, 0.6));
        } catch {
          // Ignore
        }
      }),
    );
  }

  // If still low candidates, query popular genre tags
  if (candidateMap.size < limit) {
    const fallbackTags = ['indie', 'pop', 'rock', 'electronic', 'alternative'];
    await Promise.all(
      fallbackTags.map(async (genre) => {
        try {
          const top = await getTagTopTracks(genre, 10);
          top.forEach((t) => addCandidate(t.name, t.artist, 0.5));
        } catch {
          // Ignore
        }
      }),
    );
  }

  // Rank and select candidates
  const candidates = Array.from(candidateMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(limit * 2, 40));

  // Concurrently resolve candidates to SpotifyTrack objects
  const resolvedTracks: SpotifyTrack[] = [];
  const seenSpotifyIds = new Set<string>();

  if (params.seedTracks) {
    params.seedTracks.forEach((id) => seenSpotifyIds.add(id));
  }

  const batchSize = 6;
  for (
    let i = 0;
    i < candidates.length && resolvedTracks.length < limit;
    i += batchSize
  ) {
    const batch = candidates.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((c) => searchTrack(token, c.name, c.artist)),
    );

    for (const track of results) {
      if (track && !seenSpotifyIds.has(track.id)) {
        seenSpotifyIds.add(track.id);
        resolvedTracks.push(track);
        if (resolvedTracks.length >= limit) break;
      }
    }
  }

  return { tracks: resolvedTracks };
}

export const getRecommendations = async (
  token: string,
  params: {
    seedTracks?: string[];
    seedArtists?: string[];
    seedGenres?: string[];
    seedTrackObjects?: { name: string; artist: string }[];
    targetEnergy?: number;
    targetValence?: number;
    targetDanceability?: number;
    limit?: number;
  },
): Promise<{ tracks: SpotifyTrack[] }> => {
  const qs = new URLSearchParams();
  if (params.seedTracks?.length)
    qs.set('seed_tracks', params.seedTracks.slice(0, 5).join(','));
  if (params.seedArtists?.length)
    qs.set('seed_artists', params.seedArtists.slice(0, 5).join(','));
  if (params.seedGenres?.length)
    qs.set('seed_genres', params.seedGenres.slice(0, 5).join(','));
  if (params.targetEnergy !== undefined)
    qs.set('target_energy', String(params.targetEnergy));
  if (params.targetValence !== undefined)
    qs.set('target_valence', String(params.targetValence));
  if (params.targetDanceability !== undefined)
    qs.set('target_danceability', String(params.targetDanceability));
  qs.set('limit', String(params.limit ?? 20));

  // 1. Attempt Spotify native recommendations
  try {
    const res = await spotifyFetch<{ tracks: SpotifyTrack[] }>(
      token,
      `/recommendations?${qs.toString()}`,
      undefined,
      60 * 1000,
    );
    if (res?.tracks?.length > 0) {
      return res;
    }
  } catch {
    // Spotify recommendations restricted / failed; fall back to Last.fm + Spotify Search
  }

  // 2. Fall back to Last.fm discovery + Spotify track search
  return getRecommendationsFromLastFm(token, params);
};
