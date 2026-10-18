'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Radar, Play, Pause, Music } from 'lucide-react';
import type { SpotifyTrack } from '@/types/spotify';
import { useAudioPlayer } from './AudioPlayerContext';
import EqBars from './EqBars';
import TrackTags from './TrackTags';
import { formatDuration } from '@/lib/format';

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
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors sm:gap-4 ${
        isCurrent ? 'bg-elevated/80' : 'hover:bg-elevated/60'
      }`}
    >
      {/* Rank or Play button on hover */}
      <div className="font-display text-subtle relative flex h-6 w-6 shrink-0 items-center justify-center text-right text-xs font-semibold">
        {isCurrentlyPlaying ? (
          <EqBars className="text-accent" />
        ) : typeof rank === 'number' ? (
          <span className="group-hover:hidden">{rank}</span>
        ) : null}
        <button
          onClick={() => playTrack(track)}
          aria-label={
            isCurrentlyPlaying ? `Pause ${track.name}` : `Play preview of ${track.name}`
          }
          className={`text-cream flex h-6 w-6 items-center justify-center rounded-full transition-transform hover:scale-110 ${
            isCurrentlyPlaying
              ? 'hidden group-hover:flex'
              : typeof rank === 'number'
                ? 'hidden group-hover:flex'
                : 'flex'
          }`}
          title={
            track.preview_url
              ? 'Listen to 30s preview'
              : 'Preview not available from Spotify'
          }
        >
          {isCurrentlyPlaying ? (
            <Pause className="text-accent h-3.5 w-3.5 fill-current" />
          ) : (
            <Play
              className={`h-3.5 w-3.5 fill-current ${track.preview_url ? 'text-accent' : 'text-subtle'}`}
            />
          )}
        </button>
      </div>

      {/* Album Artwork */}
      <div className="bg-elevated2 relative h-12 w-12 shrink-0 overflow-hidden rounded-md shadow-sm">
        {img ? (
          <Image
            src={img}
            alt={track.album?.name || track.name || 'Track cover'}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted flex h-full w-full items-center justify-center">
            <Music className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Track Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <a
            href={
              track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`
            }
            target="_blank"
            rel="noreferrer"
            className={`block truncate text-sm font-medium transition-colors hover:underline ${
              isCurrent ? 'text-accent font-semibold' : 'text-cream'
            }`}
          >
            {track.name}
          </a>
          {track.explicit && (
            <span className="bg-subtle/30 text-cream shrink-0 rounded px-1 text-[10px] font-bold">
              E
            </span>
          )}
        </div>
        <p className="text-subtle truncate text-xs">
          {(track.artists || []).map((a) => a.name).join(', ')}
          {meta ? ` · ${meta}` : ''}
        </p>
      </div>

      {/* Duration */}
      <span className="text-subtle hidden shrink-0 text-xs sm:block">
        {formatDuration(track.duration_ms)}
      </span>

      <TrackTags trackId={track.id} />

      {/* Audio Breakdown (Radar) Link */}
      <Link
        href={`/dashboard/track/${track.id}`}
        className="text-subtle hover:bg-elevated2 hover:text-accent shrink-0 rounded-full p-2 opacity-70 transition-all group-hover:opacity-100 hover:opacity-100"
        title="View audio breakdown DNA"
      >
        <Radar className="h-4 w-4" />
      </Link>
    </div>
  );
}
