'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Download, Clock, Disc3, Users } from 'lucide-react';
import { getRecentlyPlayed } from '@/lib/spotify';
import type { RecentlyPlayedItem } from '@/types/spotify';
import PageHeader from '@/components/PageHeader';
import TrackRow from '@/components/TrackRow';
import { TrackListSkeleton } from '@/components/Skeleton';
import { ErrorState, EmptyState } from '@/components/StateViews';

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function RecentlyPlayedPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [items, setItems] = useState<RecentlyPlayedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) return;
    getRecentlyPlayed(token, 50)
      .then((res) => setItems(res.items))
      .catch((e) => setError(e.message));
  }, [token]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.track.name.toLowerCase().includes(q) ||
        item.track.artists.some((a) => a.name.toLowerCase().includes(q)) ||
        item.track.album.name.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!items) return null;
    const totalMinutes = Math.round(
      items.reduce((sum, item) => sum + item.track.duration_ms, 0) / 60000
    );
    const uniqueArtists = new Set(items.flatMap((i) => i.track.artists.map((a) => a.id))).size;
    return {
      totalCount: items.length,
      totalMinutes,
      uniqueArtists,
    };
  }, [items]);

  // Group by day
  const groups: Record<string, RecentlyPlayedItem[]> = {};
  filteredItems.forEach((item) => {
    const key = dayLabel(item.played_at);
    groups[key] = groups[key] ? [...groups[key], item] : [item];
  });

  // Export history to CSV
  const handleExportCSV = () => {
    if (!filteredItems.length) return;
    const headers = ['Played_At', 'Title', 'Artists', 'Album', 'Duration_Sec', 'Spotify_URL'];
    const rows = filteredItems.map((item) => [
      `"${new Date(item.played_at).toISOString()}"`,
      `"${item.track.name.replace(/"/g, '""')}"`,
      `"${item.track.artists.map((a) => a.name).join(', ').replace(/"/g, '""')}"`,
      `"${item.track.album.name.replace(/"/g, '""')}"`,
      Math.round(item.track.duration_ms / 1000),
      item.track.external_urls.spotify,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonalyze-listening-history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Timeline"
        title="Recently played"
        description="Your last 50 plays with exact timestamps, instant 30s audio previews, and session metrics."
      />

      {error && <ErrorState message="Couldn't load your recent plays." hint={error} />}

      {/* Metrics Banner & Search/Export Bar */}
      {items && items.length > 0 && (
        <div className="space-y-4">
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-panel/40 p-4">
                <Disc3 className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="text-xs text-subtle">Total Tracks</p>
                  <p className="font-display text-lg font-bold text-cream">{stats.totalCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-panel/40 p-4">
                <Clock className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="text-xs text-subtle">Listening Time</p>
                  <p className="font-display text-lg font-bold text-cream">{stats.totalMinutes} min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-panel/40 p-4">
                <Users className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="text-xs text-subtle">Unique Artists</p>
                  <p className="font-display text-lg font-bold text-cream">{stats.uniqueArtists}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/8 bg-panel/30 p-3 backdrop-blur">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                type="text"
                placeholder="Search history by title, artist, or album…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/8 bg-elevated/80 pl-9 pr-3 py-1.5 text-xs text-cream placeholder-subtle outline-none focus:border-accent/40"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-elevated/80 px-3 py-1.5 text-xs font-medium text-muted hover:text-cream hover:bg-elevated transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export History CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Skeletons & Content */}
      {!error && !items && (
        <div className="space-y-4">
          <TrackListSkeleton count={8} />
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState
          title="No recent plays"
          body="Play something on Spotify and check back here."
        />
      )}

      {items && items.length > 0 && filteredItems.length === 0 && (
        <EmptyState
          title="No matching history"
          body={`No tracks match "${searchQuery}". Try a different keyword.`}
        />
      )}

      {filteredItems.length > 0 && (
        <div className="space-y-8">
          {Object.entries(groups).map(([label, group]) => (
            <section key={label}>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                {label} ({group.length})
              </h2>
              <div className="rounded-2xl border border-white/8 bg-panel/40 p-2 shadow-inner">
                {group.map((item, i) => (
                  <TrackRow
                    key={`${item.track.id}-${item.played_at}-${i}`}
                    track={item.track}
                    meta={timeLabel(item.played_at)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
