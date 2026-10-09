'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Cell,
} from 'recharts';
import { Share2, Check, Sparkles, Activity } from 'lucide-react';
import { getTopArtists, getTopTracks, getSeveralAudioFeatures, SpotifyApiError } from '@/lib/spotify';
import type { TimeRange } from '@/types/spotify';
import PageHeader from '@/components/PageHeader';
import TimeRangeTabs from '@/components/TimeRangeTabs';
import { LoadingState, ErrorState } from '@/components/StateViews';

const GREEN_SHADES = ['#1ed760', '#1db954', '#17a34a', '#0f7a37', '#0a5c2a', '#083f1c'];

const FEATURE_KEYS: { key: string; label: string }[] = [
  { key: 'danceability', label: 'Dance' },
  { key: 'energy', label: 'Energy' },
  { key: 'valence', label: 'Positivity' },
  { key: 'acousticness', label: 'Acoustic' },
  { key: 'instrumentalness', label: 'Instrumental' },
  { key: 'liveness', label: 'Liveness' },
];

export default function TasteProfilePage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [range, setRange] = useState<TimeRange>('medium_term');
  const [genreData, setGenreData] = useState<{ genre: string; count: number }[] | null>(null);
  const [radarData, setRadarData] = useState<{ stat: string; value: number }[] | null>(null);
  const [featuresUnavailable, setFeaturesUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    setGenreData(null);
    setRadarData(null);
    setFeaturesUnavailable(false);
    setError(null);

    getTopArtists(token, range, 50)
      .then((res) => {
        const counts: Record<string, number> = {};
        res.items.forEach((artist) => {
          artist.genres?.forEach((g) => {
            counts[g] = (counts[g] ?? 0) + 1;
          });
        });
        const top = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([genre, count]) => ({ genre, count }));
        setGenreData(top);
      })
      .catch((e) => setError(e.message));

    getTopTracks(token, range, 30)
      .then(async (res) => {
        const ids = res.items.map((t) => t.id);
        const { audio_features } = await getSeveralAudioFeatures(token, ids);
        const valid = audio_features.filter(Boolean) as NonNullable<typeof audio_features[number]>[];
        if (valid.length === 0) {
          setFeaturesUnavailable(true);
          return;
        }
        const avg = FEATURE_KEYS.map(({ key, label }) => ({
          stat: label,
          value: Math.round(
            (valid.reduce((sum, f) => sum + (f as any)[key], 0) / valid.length) * 100
          ),
        }));
        setRadarData(avg);
      })
      .catch((e) => {
        if (e instanceof SpotifyApiError && (e.status === 403 || e.status === 404)) {
          setFeaturesUnavailable(true);
        } else {
          setError(e.message);
        }
      });
  }, [token, range]);

  // Compute sonic archetype
  const archetype = useMemo(() => {
    if (!radarData || radarData.length === 0) return null;
    const energy = radarData.find((d) => d.stat === 'Energy')?.value ?? 50;
    const dance = radarData.find((d) => d.stat === 'Dance')?.value ?? 50;
    const acoustic = radarData.find((d) => d.stat === 'Acoustic')?.value ?? 50;
    const positivity = radarData.find((d) => d.stat === 'Positivity')?.value ?? 50;

    if (energy > 65 && dance > 60) {
      return {
        title: 'High-Octane Party Catalyst',
        desc: 'Your listening is dominated by electrifying grooves, high BPMs, and dance-floor anthems.',
      };
    }
    if (acoustic > 50) {
      return {
        title: 'Organic & Introspective Connoisseur',
        desc: 'You gravitate toward unplugged acoustic textures, vocal depth, and raw emotional resonance.',
      };
    }
    if (positivity > 65) {
      return {
        title: 'Radiant Mood Uplifter',
        desc: 'Your catalog leans heavily into sunny harmonics, vibrant melodies, and infectious optimism.',
      };
    }
    if (energy < 40 && positivity < 45) {
      return {
        title: 'Nocturnal Melodic Dreamer',
        desc: 'You appreciate dark, atmospheric soundscapes, moody chords, and deep immersive production.',
      };
    }
    return {
      title: 'Eclectic Sonic Explorer',
      desc: 'A versatile ear that balances high-intensity bangers with nuanced, rhythmic diversity.',
    };
  }, [radarData]);

  const handleCopySummary = () => {
    if (!genreData || !genreData.length) return;
    const topGenreList = genreData.slice(0, 3).map((g) => g.genre).join(', ');
    const rangeName =
      range === 'short_term'
        ? 'Last 4 Weeks'
        : range === 'medium_term'
        ? 'Last 6 Months'
        : 'All Time';
    const text = `🎧 My Sonalyze Taste Profile (${rangeName}):\n• Top Genres: ${topGenreList}\n${
      archetype ? `• Sonic Archetype: ${archetype.title}\n` : ''
    }Generated with Sonalyze`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analysis"
        title="Taste profile"
        description="Your genre spread and sonic tendencies, analyzed from your top artists and audio features."
        action={<TimeRangeTabs value={range} onChange={setRange} />}
      />

      {error && <ErrorState message="Couldn't build your taste profile." hint={error} />}

      {/* Archetype banner */}
      {archetype && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-accent/30 bg-accent/5 p-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-black shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">
                  Sonic Archetype
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-cream">{archetype.title}</h3>
              <p className="text-xs text-muted mt-0.5">{archetype.desc}</p>
            </div>
          </div>
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-white/10 bg-elevated px-3.5 py-2 text-xs font-semibold text-cream hover:border-accent/40 hover:text-accent transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-accent" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Summary</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Genres Bar Chart */}
        <div className="rounded-2xl border border-white/8 bg-panel/40 p-6 shadow-sm">
          <h2 className="mb-4 font-display text-sm font-semibold tracking-tight text-cream flex items-center justify-between">
            <span>Top genres</span>
            {genreData && genreData.length > 0 && (
              <span className="text-xs text-subtle font-normal">Ranked by artist frequency</span>
            )}
          </h2>
          {!genreData && !error && <LoadingState label="Analyzing top genres" />}
          {genreData && genreData.length > 0 && (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="genre"
                    width={120}
                    tick={{ fill: '#a7a7a7', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {genreData.map((_, i) => (
                      <Cell key={i} fill={GREEN_SHADES[i % GREEN_SHADES.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {genreData && genreData.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              Not enough genre data yet — keep listening and check back.
            </p>
          )}
        </div>

        {/* Average Sound Radar Chart */}
        <div className="rounded-2xl border border-white/8 bg-panel/40 p-6 shadow-sm">
          <h2 className="mb-4 font-display text-sm font-semibold tracking-tight text-cream flex items-center justify-between">
            <span>Audio DNA fingerprint</span>
            <span className="text-xs text-subtle font-normal">Averaged across top tracks</span>
          </h2>
          {featuresUnavailable && (
            <div className="py-12 text-center space-y-2">
              <Activity className="mx-auto h-6 w-6 text-subtle" />
              <p className="text-sm font-medium text-cream">
                Audio feature data is currently restricted by Spotify Developer tier.
              </p>
              <p className="max-w-xs mx-auto text-xs text-muted">
                If your Spotify App has extended API access, radar metrics will populate automatically.
              </p>
            </div>
          )}
          {!radarData && !featuresUnavailable && !error && (
            <LoadingState label="Computing audio feature averages" />
          )}
          {radarData && (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#282828" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: '#a7a7a7', fontSize: 11 }} />
                  <Radar
                    dataKey="value"
                    stroke="#1ed760"
                    fill="#1ed760"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
