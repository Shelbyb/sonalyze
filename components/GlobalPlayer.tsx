'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  Radar,
  Music,
} from 'lucide-react';
import { useAudioPlayer } from './AudioPlayerContext';
import EqBars from './EqBars';
import { formatClock } from '@/lib/format';

export default function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    hasPreview,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    closePlayer,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const img =
    currentTrack.album?.images?.[currentTrack.album.images.length > 2 ? 2 : 0]?.url;

  return (
    <div
      data-testid="global-audio-player"
      className="bg-panel/95 fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 lg:pl-64"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="bg-elevated2 relative h-12 w-12 shrink-0 overflow-hidden rounded-md shadow">
            {img ? (
              <Image
                src={img}
                alt={currentTrack.album.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="text-muted flex h-full w-full items-center justify-center">
                <Music className="h-5 w-5" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <EqBars className="text-accent" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-cream truncate text-sm font-semibold">
                {currentTrack.name}
              </span>
              {currentTrack.explicit && (
                <span className="bg-subtle/30 text-cream shrink-0 rounded px-1 text-[10px] font-bold">
                  E
                </span>
              )}
            </div>
            <p className="text-muted truncate text-xs">
              {currentTrack.artists.map((a) => a.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Playback Controls & Progress Bar */}
        <div className="flex max-w-md flex-1 flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={!hasPreview}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
              className="bg-accent flex h-9 w-9 items-center justify-center rounded-full text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              title={
                hasPreview
                  ? 'Space to toggle'
                  : '30s preview not provided by Spotify for this track'
              }
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-black" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-black" />
              )}
            </button>
            {!hasPreview && (
              <span className="hidden text-[11px] font-medium text-amber-400/90 sm:inline">
                Preview unavailable
              </span>
            )}
          </div>

          {hasPreview && (
            <div className="text-muted flex w-full items-center gap-2 text-[10px]">
              <span className="w-7 text-right">{formatClock(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 30}
                step={0.1}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                aria-label="Seek preview track"
                className="bg-elevated2 accent-accent h-1 flex-1 cursor-pointer appearance-none rounded-full transition-all hover:h-1.5"
              />
              <span className="w-7">{formatClock(duration || 30)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons & Volume */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="text-muted hover:text-cream transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Volume slider"
              className="bg-elevated2 accent-accent h-1 w-16 cursor-pointer appearance-none rounded-full transition-all hover:h-1.5"
            />
          </div>

          <Link
            href={`/dashboard/track/${currentTrack.id}`}
            className="bg-elevated text-muted hover:border-accent/40 hover:text-accent flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium transition-colors"
            title="View Audio DNA"
          >
            <Radar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">DNA</span>
          </Link>

          <a
            href={currentTrack.external_urls.spotify}
            target="_blank"
            rel="noreferrer"
            className="bg-elevated text-muted hover:text-cream flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium transition-colors"
            title="Open in Spotify"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            onClick={closePlayer}
            aria-label="Close player"
            className="text-muted hover:bg-elevated hover:text-cream rounded-full p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
