'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Music, Play, Pause, Wand2 } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { getTrack, getAudioFeatures, SpotifyApiError } from '@/lib/spotify';
import type { SpotifyTrack, AudioFeatures } from '@/types/spotify';
import { LoadingState, ErrorState } from '@/components/StateViews';
import { useAudioPlayer, useSpotifyToken } from '@/hooks';
import EqBars from '@/components/EqBars';
import { AUDIO_STAT_DEFINITIONS, formatMusicalKey, getCamelotKey } from '@/lib/music';

export default function TrackDetailPage() {
  const { token } = useSpotifyToken();
  const params = useParams();
  const trackId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [features, setFeatures] = useState<AudioFeatures | null>(null);
  const [featuresUnavailable, setFeaturesUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !trackId) return;
    getTrack(token, trackId)
      .then(setTrack)
      .catch((e) => setError(e.message));

    getAudioFeatures(token, trackId)
      .then(setFeatures)
      .catch((e) => {
        if (e instanceof SpotifyApiError && (e.status === 403 || e.status === 404)) {
          setFeaturesUnavailable(true);
        } else {
          setError(e.message);
        }
      });
  }, [token, trackId]);

  const radarData = useMemo(() => {
    if (!features) return [];
    return AUDIO_STAT_DEFINITIONS.map(({ key, label }) => ({
      stat: label.split(' ')[0],
      value: Math.round((features[key] as number) * 100),
    }));
  }, [features]);

  if (error) return <ErrorState message="Couldn't load this track." hint={error} />;
  if (!track) return <LoadingState label="Analyzing track audio DNA" />;

  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
  const img = track.album.images?.[0]?.url;
  const keyText = features ? formatMusicalKey(features.key, features.mode) : '—';
  const camelotKey = features ? getCamelotKey(features.key, features.mode) : null;

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/top-tracks"
        className="text-muted hover:text-cream inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Tracks
      </Link>

      {/* Hero Track Card */}
      <div className="bg-panel/50 flex flex-col gap-6 rounded-3xl border border-white/8 p-6 backdrop-blur sm:flex-row sm:items-end sm:p-8">
        <div className="group bg-elevated2 relative h-44 w-44 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
          {img && (
            <Image
              src={img}
              alt={track.album.name}
              fill
              priority
              sizes="180px"
              className="object-cover"
            />
          )}
          {track.preview_url && (
            <button
              onClick={() => playTrack(track)}
              aria-label={isCurrentPlaying ? 'Pause preview' : 'Play 30s preview'}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100"
            >
              <div className="bg-accent flex h-14 w-14 items-center justify-center rounded-full text-black shadow-lg transition-transform hover:scale-110">
                {isCurrentPlaying ? (
                  <Pause className="h-6 w-6 fill-black" />
                ) : (
                  <Play className="ml-1 h-6 w-6 fill-black" />
                )}
              </div>
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              Track Analysis
            </span>
            {isCurrentPlaying && <EqBars className="text-accent" />}
          </div>
          <h1 className="font-display text-cream mt-1 truncate text-3xl font-bold tracking-tight sm:text-4xl">
            {track.name}
          </h1>
          <p className="text-muted mt-2 truncate text-base">
            {track.artists.map((a) => a.name).join(', ')} ·{' '}
            <span className="text-subtle">{track.album.name}</span>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            {track.preview_url ? (
              <button
                onClick={() => playTrack(track)}
                className="bg-accent shadow-accent/20 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-semibold text-black shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                {isCurrentPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-black" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-black" />
                )}
                <span>{isCurrentPlaying ? 'Pause 30s Preview' : 'Play 30s Preview'}</span>
              </button>
            ) : (
              <span className="bg-elevated text-subtle rounded-full px-3 py-1.5">
                Preview unavailable
              </span>
            )}

            <Link
              href="/dashboard/discover"
              className="bg-elevated text-cream hover:border-accent/40 hover:text-accent inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 font-medium transition-colors"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Generate Mix from this Vibe</span>
            </Link>

            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="bg-elevated text-muted hover:text-cream inline-flex items-center gap-1 rounded-full border border-white/10 px-3.5 py-1.5 font-medium transition-colors"
            >
              <span>Spotify</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {featuresUnavailable && (
        <div className="bg-panel/40 rounded-2xl border border-white/8 p-8 text-center">
          <Music className="text-subtle mx-auto mb-3 h-6 w-6" />
          <p className="text-cream text-sm font-medium">
            Audio DNA features aren't available for this track
          </p>
          <p className="text-muted mx-auto mt-2 max-w-md text-xs">
            Spotify restricts the audio-features endpoint on standard developer apps. When
            extended API access is granted, these radar metrics populate in real-time.
          </p>
        </div>
      )}

      {features && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Audio DNA Radar Chart */}
          <div className="bg-panel/40 rounded-2xl border border-white/8 p-6 shadow-sm">
            <h2 className="font-display text-cream mb-4 text-sm font-semibold tracking-tight">
              Audio DNA Radar
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#282828" />
                  <PolarAngleAxis
                    dataKey="stat"
                    tick={{ fill: '#a7a7a7', fontSize: 11 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#1ed760"
                    fill="#1ed760"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Progress Bars & Harmonic Details */}
          <div className="bg-panel/40 flex flex-col justify-between rounded-2xl border border-white/8 p-6 shadow-sm">
            <div>
              <h2 className="font-display text-cream mb-4 text-sm font-semibold tracking-tight">
                Audio Metrics Breakdown
              </h2>
              <div className="space-y-3.5">
                {AUDIO_STAT_DEFINITIONS.map(({ key, label, hint }) => (
                  <div key={key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-cream text-xs font-medium" title={hint}>
                        {label}
                      </span>
                      <span className="text-accent font-mono text-xs">
                        {Math.round((features[key] as number) * 100)}%
                      </span>
                    </div>
                    <div className="bg-elevated2 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${(features[key] as number) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tempo, Key, Camelot & Loudness Grid */}
            <div className="mt-6 grid grid-cols-4 gap-2 border-t border-white/8 pt-5 text-center">
              <div className="bg-elevated/60 rounded-xl p-2.5">
                <p className="text-subtle text-[10px] font-semibold uppercase">Tempo</p>
                <p className="font-display text-cream mt-0.5 text-base font-bold">
                  {Math.round(features.tempo)}{' '}
                  <span className="text-muted text-[10px]">BPM</span>
                </p>
              </div>
              <div className="bg-elevated/60 rounded-xl p-2.5">
                <p className="text-subtle text-[10px] font-semibold uppercase">Key</p>
                <p className="font-display text-cream mt-0.5 text-base font-bold">
                  {keyText}
                </p>
              </div>
              <div className="bg-elevated/60 rounded-xl p-2.5">
                <p className="text-subtle text-[10px] font-semibold uppercase">Camelot</p>
                <p className="font-display text-accent mt-0.5 text-base font-bold">
                  {camelotKey ?? '—'}
                </p>
              </div>
              <div className="bg-elevated/60 rounded-xl p-2.5">
                <p className="text-subtle text-[10px] font-semibold uppercase">
                  Loudness
                </p>
                <p className="font-display text-cream mt-0.5 text-base font-bold">
                  {features.loudness.toFixed(1)}{' '}
                  <span className="text-muted text-[10px]">dB</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
