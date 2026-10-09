'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Music,
  Play,
  Pause,
  Wand2,
  Activity,
  Sparkles,
  Gauge,
  Key,
  Volume2,
} from 'lucide-react';
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
import { useAudioPlayer } from '@/components/AudioPlayerContext';
import EqBars from '@/components/EqBars';

const KEYS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

// Camelot wheel mapping for harmonic mixing
const CAMELOT_KEYS: Record<string, string> = {
  'C maj': '8B', 'C min': '5A',
  'C♯ maj': '3B', 'C♯ min': '12A',
  'D maj': '10B', 'D min': '7A',
  'D♯ maj': '5B', 'D♯ min': '2A',
  'E maj': '12B', 'E min': '9A',
  'F maj': '7B', 'F min': '4A',
  'F♯ maj': '2B', 'F♯ min': '11A',
  'G maj': '9B', 'G min': '6A',
  'G♯ maj': '4B', 'G♯ min': '1A',
  'A maj': '11B', 'A min': '8A',
  'A♯ maj': '6B', 'A♯ min': '3A',
  'B maj': '1B', 'B min': '10A',
};

const STAT_LABELS: { key: keyof AudioFeatures; label: string; hint: string }[] = [
  { key: 'danceability', label: 'Danceability', hint: 'Rhythmic suitability for dancing based on tempo and beat strength' },
  { key: 'energy', label: 'Energy', hint: 'Perceived intensity, activity, speed, and loudness' },
  { key: 'valence', label: 'Valence (Positivity)', hint: 'Musical cheerfulness and euphoria vs gloominess' },
  { key: 'acousticness', label: 'Acousticness', hint: 'Confidence level whether the track is purely acoustic' },
  { key: 'instrumentalness', label: 'Instrumentalness', hint: 'Likelihood that the track contains no vocal content' },
  { key: 'liveness', label: 'Liveness', hint: 'Audience presence detection in the recording' },
  { key: 'speechiness', label: 'Speechiness', hint: 'Presence of spoken words like rap or podcast' },
];

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrackDetailPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const params = useParams();
  const router = useRouter();
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

  if (error) return <ErrorState message="Couldn't load this track." hint={error} />;
  if (!track) return <LoadingState label="Analyzing track audio DNA" />;

  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
  const img = track.album.images?.[0]?.url;
  const radarData = features
    ? STAT_LABELS.map(({ key, label }) => ({
        stat: label.split(' ')[0],
        value: Math.round((features[key] as number) * 100),
      }))
    : [];

  const keyText = `${KEYS[features?.key ?? 0] ?? '—'} ${features?.mode === 1 ? 'maj' : 'min'}`;
  const camelotKey = CAMELOT_KEYS[keyText] ?? null;

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/top-tracks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-cream transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Tracks
      </Link>

      {/* Hero Track Card */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end rounded-3xl border border-white/8 bg-panel/50 p-6 sm:p-8 backdrop-blur">
        <div className="group relative h-44 w-44 shrink-0 overflow-hidden rounded-2xl bg-elevated2 shadow-2xl ring-1 ring-white/10">
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
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-black shadow-lg transition-transform hover:scale-110">
                {isCurrentPlaying ? (
                  <Pause className="h-6 w-6 fill-black" />
                ) : (
                  <Play className="h-6 w-6 fill-black ml-1" />
                )}
              </div>
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Track Analysis
            </span>
            {isCurrentPlaying && <EqBars className="text-accent" />}
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl text-cream truncate">
            {track.name}
          </h1>
          <p className="mt-2 text-base text-muted truncate">
            {track.artists.map((a) => a.name).join(', ')} · <span className="text-subtle">{track.album.name}</span>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            {track.preview_url ? (
              <button
                onClick={() => playTrack(track)}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 font-semibold text-black transition-transform hover:scale-105 active:scale-95 shadow-md shadow-accent/20"
              >
                {isCurrentPlaying ? <Pause className="h-3.5 w-3.5 fill-black" /> : <Play className="h-3.5 w-3.5 fill-black" />}
                <span>{isCurrentPlaying ? 'Pause 30s Preview' : 'Play 30s Preview'}</span>
              </button>
            ) : (
              <span className="rounded-full bg-elevated px-3 py-1.5 text-subtle">
                Preview unavailable
              </span>
            )}

            <Link
              href="/dashboard/discover"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-elevated px-3.5 py-1.5 font-medium text-cream hover:border-accent/40 hover:text-accent transition-colors"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Generate Mix from this Vibe</span>
            </Link>

            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-elevated px-3.5 py-1.5 font-medium text-muted hover:text-cream transition-colors"
            >
              <span>Spotify</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {featuresUnavailable && (
        <div className="rounded-2xl border border-white/8 bg-panel/40 p-8 text-center">
          <Music className="mx-auto mb-3 h-6 w-6 text-subtle" />
          <p className="text-sm font-medium text-cream">Audio DNA features aren't available for this track</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted">
            Spotify restricts the audio-features endpoint on standard developer apps. When extended API access is granted, these radar metrics populate in real-time.
          </p>
        </div>
      )}

      {features && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Audio DNA Radar Chart */}
          <div className="rounded-2xl border border-white/8 bg-panel/40 p-6 shadow-sm">
            <h2 className="mb-4 font-display text-sm font-semibold tracking-tight text-cream">
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
          <div className="rounded-2xl border border-white/8 bg-panel/40 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="mb-4 font-display text-sm font-semibold tracking-tight text-cream">
                Audio Metrics Breakdown
              </h2>
              <div className="space-y-3.5">
                {STAT_LABELS.map(({ key, label, hint }) => (
                  <div key={key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-xs font-medium text-cream" title={hint}>
                        {label}
                      </span>
                      <span className="text-xs font-mono text-accent">
                        {Math.round((features[key] as number) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated2">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${(features[key] as number) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tempo, Key, Camelot & Loudness Grid */}
            <div className="mt-6 grid grid-cols-4 gap-2 border-t border-white/8 pt-5 text-center">
              <div className="rounded-xl bg-elevated/60 p-2.5">
                <p className="text-[10px] uppercase font-semibold text-subtle">Tempo</p>
                <p className="font-display text-base font-bold text-cream mt-0.5">
                  {Math.round(features.tempo)} <span className="text-[10px] text-muted">BPM</span>
                </p>
              </div>
              <div className="rounded-xl bg-elevated/60 p-2.5">
                <p className="text-[10px] uppercase font-semibold text-subtle">Key</p>
                <p className="font-display text-base font-bold text-cream mt-0.5">
                  {keyText}
                </p>
              </div>
              <div className="rounded-xl bg-elevated/60 p-2.5">
                <p className="text-[10px] uppercase font-semibold text-subtle">Camelot</p>
                <p className="font-display text-base font-bold text-accent mt-0.5">
                  {camelotKey ?? '—'}
                </p>
              </div>
              <div className="rounded-xl bg-elevated/60 p-2.5">
                <p className="text-[10px] uppercase font-semibold text-subtle">Loudness</p>
                <p className="font-display text-base font-bold text-cream mt-0.5">
                  {features.loudness.toFixed(1)} <span className="text-[10px] text-muted">dB</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
