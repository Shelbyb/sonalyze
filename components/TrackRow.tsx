'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Radar, Play, Pause, Music } from 'lucide-react';
import type { SpotifyTrack } from '@/types/spotify';
import { useAudioPlayer } from './AudioPlayerContext';
import EqBars from './EqBars';

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrackRow({
  track,
  rank,
  meta,
}: {
  track: SpotifyTrack;
  rank?: number;
  meta?: string;
}) {
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();
  const isCurrent = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  const img = track.album?.images?.[track.album.images.length > 2 ? 2 : 0]?.url;

  return (
    <div
      data-testid="track-row"
      className={`group flex items-center gap-3 sm:gap-4 rounded-xl px-3 py-2.5 transition-colors ${
        isCurrent ? 'bg-elevated/80' : 'hover:bg-elevated/60'
      }`}
    >
      {/* Rank or Play button on hover */}
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center text-right font-display text-xs font-semibold text-subtle">
        {isCurrentlyPlaying ? (
          <EqBars className="text-accent" />
        ) : typeof rank === 'number' ? (
          <span className="group-hover:hidden">{rank}</span>
        ) : null}
        <button
          onClick={() => playTrack(track)}
          aria-label={isCurrentlyPlaying ? `Pause ${track.name}` : `Play preview of ${track.name}`}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-cream transition-transform hover:scale-110 ${
            isCurrentlyPlaying ? 'hidden group-hover:flex' : typeof rank === 'number' ? 'hidden group-hover:flex' : 'flex'
          }`}
          title={track.preview_url ? 'Listen to 30s preview' : 'Preview not available from Spotify'}
        >
          {isCurrentlyPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-current text-accent" />
          ) : (
            <Play className={`h-3.5 w-3.5 fill-current ${track.preview_url ? 'text-accent' : 'text-subtle'}`} />
          )}
        </button>
      </div>

      {/* Album Artwork */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-elevated2 shadow-sm">
        {img ? (
          <Image
            src={img}
            alt={track.album?.name || track.name || 'Track cover'}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <Music className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Track Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <a
            href={track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`}
            target="_blank"
            rel="noreferrer"
            className={`block truncate text-sm font-medium transition-colors hover:underline ${
              isCurrent ? 'text-accent font-semibold' : 'text-cream'
            }`}
          >
            {track.name}
          </a>
          {track.explicit && (
            <span className="shrink-0 rounded bg-subtle/30 px-1 text-[10px] font-bold text-cream">
              E
            </span>
          )}
        </div>
        <p className="truncate text-xs text-subtle">
          {(track.artists || []).map((a) => a.name).join(', ')}
          {meta ? ` · ${meta}` : ''}
        </p>
      </div>

      {/* Duration */}
      <span className="hidden shrink-0 text-xs text-subtle sm:block">
        {formatDuration(track.duration_ms)}
      </span>

      {/* Audio Breakdown (Radar) Link */}
      <Link
        href={`/dashboard/track/${track.id}`}
        className="shrink-0 rounded-full p-2 text-subtle opacity-70 transition-all hover:bg-elevated2 hover:text-accent hover:opacity-100 group-hover:opacity-100"
        title="View audio breakdown DNA"
      >
        <Radar className="h-4 w-4" />
      </Link>
    </div>
  );
}
