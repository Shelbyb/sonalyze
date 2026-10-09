'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getTopArtists } from '@/lib/spotify';
import type { SpotifyArtist, TimeRange } from '@/types/spotify';
import PageHeader from '@/components/PageHeader';
import ArtistCard from '@/components/ArtistCard';
import TimeRangeTabs from '@/components/TimeRangeTabs';
import { ArtistGridSkeleton } from '@/components/Skeleton';
import { ErrorState, EmptyState } from '@/components/StateViews';

type SortOption = 'rank' | 'name' | 'popularity';

export default function TopArtistsPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [range, setRange] = useState<TimeRange>('medium_term');
  const [artists, setArtists] = useState<SpotifyArtist[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rank');

  useEffect(() => {
    if (!token) return;
    setArtists(null);
    setError(null);
    setSelectedGenre(null);
    getTopArtists(token, range, 50)
      .then((res) => setArtists(res.items))
      .catch((e) => setError(e.message));
  }, [token, range]);

  // Extract top genres from artists
  const topGenres = useMemo(() => {
    if (!artists) return [];
    const counts: Record<string, number> = {};
    artists.forEach((a) => {
      a.genres?.forEach((g) => {
        counts[g] = (counts[g] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre]) => genre);
  }, [artists]);

  // Filter & sort
  const filteredArtists = useMemo(() => {
    if (!artists) return [];
    let result = [...artists];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.genres?.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (selectedGenre) {
      result = result.filter((a) => a.genres?.includes(selectedGenre));
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'popularity') return (b.popularity ?? 0) - (a.popularity ?? 0);
      return (artists.indexOf(a) ?? 0) - (artists.indexOf(b) ?? 0);
    });

    return result;
  }, [artists, searchQuery, selectedGenre, sortBy]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your Library"
        title="Top artists"
        description="The artists you keep coming back to, ranked by Spotify frequency with genre breakdowns."
        action={<TimeRangeTabs value={range} onChange={setRange} />}
      />

      {error && <ErrorState message="Couldn't load your top artists." hint={error} />}

      {/* Control Bar: Search & Sort */}
      {artists && artists.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/8 bg-panel/30 p-3 backdrop-blur">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                type="text"
                placeholder="Search artists or genres…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/8 bg-elevated/80 pl-9 pr-3 py-1.5 text-xs text-cream placeholder-subtle outline-none focus:border-accent/40"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-elevated/80 px-2.5 py-1 text-xs text-muted">
              <SlidersHorizontal className="h-3.5 w-3.5 text-subtle" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort artists by"
                className="bg-transparent text-xs text-cream outline-none cursor-pointer"
              >
                <option value="rank" className="bg-panel text-cream">Sort: Rank</option>
                <option value="name" className="bg-panel text-cream">Sort: Name</option>
                <option value="popularity" className="bg-panel text-cream">Sort: Popularity</option>
              </select>
            </div>
          </div>

          {/* Genre Filter Pills */}
          {topGenres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 px-1">
              <span className="text-[11px] font-semibold text-subtle uppercase mr-1">Filter Genre:</span>
              <button
                onClick={() => setSelectedGenre(null)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  selectedGenre === null
                    ? 'bg-accent text-black font-semibold'
                    : 'bg-elevated text-muted hover:text-cream'
                }`}
              >
                All
              </button>
              {topGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition-colors ${
                    selectedGenre === g
                      ? 'bg-accent text-black font-semibold'
                      : 'bg-elevated text-muted hover:text-cream'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skeletons & Content */}
      {!error && !artists && <ArtistGridSkeleton count={15} />}

      {artists && artists.length === 0 && (
        <EmptyState
          title="No top artists yet"
          body="Spotify needs a bit more listening history before it can rank your artists for this period."
        />
      )}

      {artists && artists.length > 0 && filteredArtists.length === 0 && (
        <EmptyState
          title="No matching artists"
          body={`No artists match your current search or genre filter. Try clearing filters.`}
        />
      )}

      {filteredArtists.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredArtists.map((a, i) => (
            <ArtistCard
              key={a.id}
              artist={a}
              rank={sortBy === 'rank' ? (artists ? artists.indexOf(a) + 1 : i + 1) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
