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

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

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

  const img = currentTrack.album?.images?.[currentTrack.album.images.length > 2 ? 2 : 0]?.url;

  return (
    <div
      data-testid="global-audio-player"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-panel/95 px-4 py-2.5 backdrop-blur-md shadow-2xl transition-all duration-300 lg:pl-64"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-elevated2 shadow">
            {img ? (
              <Image
                src={img}
                alt={currentTrack.album.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">
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
              <span className="truncate text-sm font-semibold text-cream">
                {currentTrack.name}
              </span>
              {currentTrack.explicit && (
                <span className="shrink-0 rounded bg-subtle/30 px-1 text-[10px] font-bold text-cream">
                  E
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted">
              {currentTrack.artists.map((a) => a.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Playback Controls & Progress Bar */}
        <div className="flex flex-1 flex-col items-center gap-1.5 max-w-md">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={!hasPreview}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              title={hasPreview ? 'Space to toggle' : '30s preview not provided by Spotify for this track'}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black ml-0.5" />}
            </button>
            {!hasPreview && (
              <span className="text-[11px] font-medium text-amber-400/90 hidden sm:inline">
                Preview unavailable
              </span>
            )}
          </div>

          {hasPreview && (
            <div className="flex w-full items-center gap-2 text-[10px] text-muted">
              <span className="w-7 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 30}
                step={0.1}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                aria-label="Seek preview track"
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-elevated2 accent-accent hover:h-1.5 transition-all"
              />
              <span className="w-7">{formatTime(duration || 30)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons & Volume */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
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
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-elevated2 accent-accent hover:h-1.5 transition-all"
            />
          </div>

          <Link
            href={`/dashboard/track/${currentTrack.id}`}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-elevated px-2.5 py-1 text-xs font-medium text-muted hover:border-accent/40 hover:text-accent transition-colors"
            title="View Audio DNA"
          >
            <Radar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">DNA</span>
          </Link>

          <a
            href={currentTrack.external_urls.spotify}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-full border border-white/10 bg-elevated px-2.5 py-1 text-xs font-medium text-muted hover:text-cream transition-colors"
            title="Open in Spotify"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            onClick={closePlayer}
            aria-label="Close player"
            className="rounded-full p-1 text-muted hover:bg-elevated hover:text-cream transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
