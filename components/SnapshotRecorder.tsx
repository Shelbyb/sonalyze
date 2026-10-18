'use client';

import { useEffect, useRef } from 'react';
import { useCapabilities } from '@/hooks/useCapabilities';
import type { SpotifyArtist, SpotifyTrack, TimeRange } from '@/types/spotify';
import { fetchWithRetry } from '@/lib/fetch-retry';

/** Records a listening snapshot when history is enabled. The server throttles duplicates. */
export default function SnapshotRecorder({
  timeRange,
  tracks,
  artists,
}: {
  timeRange: TimeRange;
  tracks: SpotifyTrack[] | null;
  artists: SpotifyArtist[] | null;
}) {
  const { history } = useCapabilities();
  const sent = useRef(false);

  useEffect(() => {
    if (!history || sent.current || !tracks || !artists) return;
    sent.current = true;
    const slim = {
      topTracks: tracks.map((t) => ({
        id: t.id,
        name: t.name,
        artists: (t.artists || []).map((a) => a.name),
        popularity: t.popularity,
      })),
      topArtists: artists.map((a) => ({
        id: a.id,
        name: a.name,
        genres: a.genres,
        popularity: a.popularity,
      })),
    };
    fetchWithRetry('/api/user/history', {
      method: 'POST',
      body: JSON.stringify({ timeRange, ...slim }),
    }).catch(() => {});
  }, [history, tracks, artists, timeRange]);

  return null;
}
