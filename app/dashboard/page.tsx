'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Music2,
  History,
  Wand2,
  Compass,
  Sparkles,
  Flame,
  Radio,
  Disc3,
} from 'lucide-react';
import { getTopArtists, getTopTracks, getRecentlyPlayed } from '@/lib/spotify';
import type { SpotifyArtist, SpotifyTrack, RecentlyPlayedItem } from '@/types/spotify';
import PageHeader from '@/components/PageHeader';
import ArtistCard from '@/components/ArtistCard';
import TrackRow from '@/components/TrackRow';
import StatCard from '@/components/StatCard';
import { TrackListSkeleton, ArtistGridSkeleton, StatCardSkeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/StateViews';

export default function DashboardOverview() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [artists, setArtists] = useState<SpotifyArtist[] | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);
  const [recent, setRecent] = useState<RecentlyPlayedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([
      getTopArtists(token, 'short_term', 5),
      getTopTracks(token, 'short_term', 5),
      getRecentlyPlayed(token, 8),
    ])
      .then(([a, t, r]) => {
        if (cancelled) return;
        setArtists(a.items);
        setTracks(t.items);
        setRecent(r.items);
      })
      .catch((e) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Compute aggregate stats from loaded data
  const stats = useMemo(() => {
    if (!artists || !tracks || !recent) return null;

    // Top primary genre
    const genreMap: Record<string, number> = {};
    artists.forEach((a) => {
      a.genres?.forEach((g) => {
        genreMap[g] = (genreMap[g] ?? 0) + 1;
      });
    });
    const topGenre =
      Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Eclectic';

    // Top artist name
    const topArtist = artists[0]?.name ?? 'N/A';

    // Top track name
    const topTrack = tracks[0]?.name ?? 'N/A';

    // Total duration of recent queue in minutes
    const recentMins = Math.round(
      recent.reduce((acc, item) => acc + item.track.duration_ms, 0) / 60000
    );

    return {
      topGenre,
      topArtist,
      topTrack,
      recentMins,
      tracksCount: tracks.length,
      artistsCount: artists.length,
    };
  }, [artists, tracks, recent]);

  const name = session?.user?.name?.split(' ')[0];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Intelligence Hub"
        title={name ? `Welcome back, ${name}` : 'Welcome back'}
        description="A real-time overview of your musical identity, audio preferences, and recent sessions."
        action={
          <Link
            href="/dashboard/discover"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
          >
            <Sparkles className="h-4 w-4" /> Smart Generator
          </Link>
        }
      />

      {error && <ErrorState message={error} />}

      {/* Quick Metrics Cards */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!stats ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Top Artist This Month"
                value={stats.topArtist}
                subtitle="Most played act"
                icon={Flame}
                badge="#1 Rank"
              />
              <StatCard
                title="Top Track"
                value={stats.topTrack}
                subtitle="On heavy rotation"
                icon={Disc3}
                badge="Favorite"
              />
              <StatCard
                title="Dominant Genre"
                value={stats.topGenre.charAt(0).toUpperCase() + stats.topGenre.slice(1)}
                subtitle="Taste profile leader"
                icon={Radio}
                badge="Style"
              />
              <StatCard
                title="Recent Sessions"
                value={`${stats.recentMins} min`}
                subtitle={`Across ${recent?.length ?? 0} recent plays`}
                icon={History}
                badge="Active"
              />
            </>
          )}
        </div>
      </section>

      {/* Top Artists Preview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-cream">
            <BarChart3 className="h-4 w-4 text-accent" /> Top artists this month
          </h2>
          <Link
            href="/dashboard/top-artists"
            className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-accent transition-colors"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {!artists ? (
          <ArtistGridSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {artists.map((a, i) => (
              <ArtistCard key={a.id} artist={a} rank={i + 1} />
            ))}
          </div>
        )}
      </section>

      {/* Top Tracks Preview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-cream">
            <Music2 className="h-4 w-4 text-accent" /> Top tracks this month
          </h2>
          <Link
            href="/dashboard/top-tracks"
            className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-accent transition-colors"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {!tracks ? (
          <TrackListSkeleton count={5} />
        ) : (
          <div className="rounded-2xl border border-white/8 bg-panel/40 p-2 shadow-inner">
            {tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} rank={i + 1} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Played */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-cream">
            <History className="h-4 w-4 text-accent" /> Recently played
          </h2>
          <Link
            href="/dashboard/recently-played"
            className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-accent transition-colors"
          >
            See timeline <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {!recent ? (
          <TrackListSkeleton count={5} />
        ) : (
          <div className="rounded-2xl border border-white/8 bg-panel/40 p-2 shadow-inner">
            {recent.slice(0, 5).map((r, i) => (
              <TrackRow key={`${r.track.id}-${r.played_at}-${i}`} track={r.track} />
            ))}
          </div>
        )}
      </section>

      {/* Generator Callout */}
      <Link
        href="/dashboard/discover"
        className="flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/5 p-6 transition-all duration-300 hover:border-accent/60 hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-black shadow-md shadow-accent/20">
            <Wand2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-base font-semibold tracking-tight text-cream">
              Build a custom mix from your sonic profile
            </p>
            <p className="text-sm text-muted">
              Select any seed playlist, fine-tune energy, mood, and danceability, and save new discoveries directly to Spotify.
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-accent" />
      </Link>
    </div>
  );
}
