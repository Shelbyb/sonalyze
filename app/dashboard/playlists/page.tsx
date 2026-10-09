'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Lock, Wand2, Search, SlidersHorizontal, ListMusic } from 'lucide-react';
import { getUserPlaylists } from '@/lib/spotify';
import type { SpotifyPlaylist } from '@/types/spotify';
import PageHeader from '@/components/PageHeader';
import { ErrorState, EmptyState } from '@/components/StateViews';

type PrivacyFilter = 'all' | 'public' | 'private';

export default function PlaylistsPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [playlists, setPlaylists] = useState<SpotifyPlaylist[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>('all');

  useEffect(() => {
    if (!token) return;
    getUserPlaylists(token, 50)
      .then((res) => setPlaylists(res.items.filter(Boolean)))
      .catch((e) => setError(e.message));
  }, [token]);

  const filteredPlaylists = useMemo(() => {
    if (!playlists) return [];
    let result = [...playlists];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.owner.display_name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (privacyFilter === 'public') {
      result = result.filter((p) => p.public);
    } else if (privacyFilter === 'private') {
      result = result.filter((p) => !p.public);
    }

    return result;
  }, [playlists, searchQuery, privacyFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Your playlists"
        description="Every playlist you own or follow. Seed any playlist into the generator to create smart mixes."
        action={
          <Link
            href="/dashboard/discover"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95 shadow-md shadow-accent/20"
          >
            <Wand2 className="h-4 w-4" /> Generate mix
          </Link>
        }
      />

      {error && <ErrorState message="Couldn't load your playlists." hint={error} />}

      {/* Control Bar: Search & Privacy Filter */}
      {playlists && playlists.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/8 bg-panel/30 p-3 backdrop-blur">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              placeholder="Search playlists…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/8 bg-elevated/80 pl-9 pr-3 py-1.5 text-xs text-cream placeholder-subtle outline-none focus:border-accent/40"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-subtle uppercase mr-1">Type:</span>
            {(['all', 'public', 'private'] as PrivacyFilter[]).map((type) => (
              <button
                key={type}
                onClick={() => setPrivacyFilter(type)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition-colors ${
                  privacyFilter === type
                    ? 'bg-accent text-black font-semibold'
                    : 'bg-elevated text-muted hover:text-cream'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {!error && !playlists && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse flex-col rounded-2xl border border-white/8 bg-panel/50 p-4"
            >
              <div className="aspect-square w-full rounded-lg bg-white/10 mb-4" />
              <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {playlists && playlists.length === 0 && (
        <EmptyState
          title="No playlists found"
          body="Create a playlist on Spotify and it will appear here."
        />
      )}

      {playlists && playlists.length > 0 && filteredPlaylists.length === 0 && (
        <EmptyState
          title="No matching playlists"
          body={`No playlists match "${searchQuery}". Try a different search.`}
        />
      )}

      {filteredPlaylists.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredPlaylists.map((p) => {
            const img = p.images?.[0]?.url;
            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-panel/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-panel hover:shadow-xl"
              >
                <div>
                  <a
                    href={p.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg bg-elevated2 shadow ring-1 ring-white/10 group-hover:ring-accent/40 transition-all">
                      {img ? (
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 160px, 200px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted">
                          <ListMusic className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <h3 className="truncate font-display text-sm font-semibold tracking-tight text-cream group-hover:text-accent transition-colors">
                      {p.name}
                    </h3>
                  </a>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-subtle">
                    {!p.public && <Lock className="h-3 w-3 shrink-0 text-amber-400" />}
                    <span>{p.tracks.total} tracks</span>
                    {p.owner.display_name && (
                      <span className="truncate">· by {p.owner.display_name}</span>
                    )}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/5">
                  <Link
                    href={`/dashboard/discover`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>Seed Mix</span>
                  </Link>
                  <a
                    href={p.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="text-subtle hover:text-cream transition-colors"
                    title="Open on Spotify"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
