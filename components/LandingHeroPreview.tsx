'use client';

import { useState } from 'react';
import {
  Activity,
  Play,
  Volume2,
  Sparkles,
  Zap,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import EqBars from './EqBars';

export default function LandingHeroPreview() {
  const [activeTab, setActiveTab] = useState<'radar' | 'player' | 'archetype'>('radar');

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Glow backdrop behind preview card */}
      <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent/30 via-emerald-500/20 to-teal-400/20 opacity-70 blur-xl transition-all duration-500 group-hover:opacity-100" />

      {/* Main glass card container */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Top Header / Switcher */}
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-3 w-3 items-center justify-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Live Audio Telemetry
            </span>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 rounded-full border border-white/8 bg-elevated p-1 text-xs">
            <button
              onClick={() => setActiveTab('radar')}
              className={`rounded-full px-3 py-1 font-medium transition-all ${
                activeTab === 'radar'
                  ? 'bg-accent text-black shadow-sm'
                  : 'text-subtle hover:text-cream'
              }`}
            >
              Radar
            </button>
            <button
              onClick={() => setActiveTab('player')}
              className={`rounded-full px-3 py-1 font-medium transition-all ${
                activeTab === 'player'
                  ? 'bg-accent text-black shadow-sm'
                  : 'text-subtle hover:text-cream'
              }`}
            >
              Player
            </button>
            <button
              onClick={() => setActiveTab('archetype')}
              className={`rounded-full px-3 py-1 font-medium transition-all ${
                activeTab === 'archetype'
                  ? 'bg-accent text-black shadow-sm'
                  : 'text-subtle hover:text-cream'
              }`}
            >
              Archetype
            </button>
          </div>
        </div>

        {/* Tab 1: Audio Radar View */}
        {activeTab === 'radar' && (
          <div className="mt-5 space-y-4 animate-rise">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  Multi-Dimensional DNA
                </span>
                <h4 className="mt-1 font-display text-lg font-bold text-cream">
                  Electronic & Indie Dance Fingerprint
                </h4>
                <p className="text-xs text-muted">Averaged from your top 50 heavy-rotation tracks</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-subtle">Sonic Tempo</div>
                <div className="font-display text-base font-bold text-accent">124 BPM</div>
              </div>
            </div>

            {/* Visual SVG Radar polygon simulation */}
            <div className="relative flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-white/5 bg-elevated/60 p-4">
              <svg viewBox="0 0 200 200" className="h-full w-full max-w-[240px]">
                {/* Concentric grid rings */}
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                  <polygon
                    key={i}
                    points="100,20 169,60 169,140 100,180 31,140 31,60"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                    transform={`scale(${scale})`}
                    style={{ transformOrigin: '100px 100px' }}
                  />
                ))}

                {/* Radar axes */}
                <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="31" y1="60" x2="169" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="31" y1="140" x2="169" y2="60" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Active Data Polygon */}
                <polygon
                  points="100,32 160,68 152,132 100,165 48,130 42,75"
                  fill="rgba(30,215,96,0.28)"
                  stroke="#1ed760"
                  strokeWidth="2.5"
                  className="transition-all duration-700"
                />

                {/* Radar Vertex Dots */}
                <circle cx="100" cy="32" r="3.5" fill="#1ed760" />
                <circle cx="160" cy="68" r="3.5" fill="#1ed760" />
                <circle cx="152" cy="132" r="3.5" fill="#1ed760" />
                <circle cx="100" cy="165" r="3.5" fill="#1ed760" />
                <circle cx="48" cy="130" r="3.5" fill="#1ed760" />
                <circle cx="42" cy="75" r="3.5" fill="#1ed760" />

                {/* Dimension Labels */}
                <text x="100" y="14" textAnchor="middle" fill="#f5f3ee" fontSize="8" fontWeight="600">Dance (88%)</text>
                <text x="180" y="62" textAnchor="start" fill="#a7a7a7" fontSize="7.5">Energy (76%)</text>
                <text x="178" y="146" textAnchor="start" fill="#a7a7a7" fontSize="7.5">Valence (64%)</text>
                <text x="100" y="194" textAnchor="middle" fill="#a7a7a7" fontSize="7.5">Acoustic (18%)</text>
                <text x="24" y="146" textAnchor="end" fill="#a7a7a7" fontSize="7.5">Speech (12%)</text>
                <text x="24" y="62" textAnchor="end" fill="#a7a7a7" fontSize="7.5">Liveness (32%)</text>
              </svg>

              {/* Floating key tag */}
              <div className="absolute bottom-3 right-3 rounded-lg border border-white/8 bg-panel/80 px-2.5 py-1 text-[11px] font-mono text-cream backdrop-blur">
                Camelot Key: <span className="font-bold text-accent">8B (C Major)</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="rounded-xl border border-white/5 bg-elevated p-2">
                <div className="text-[10px] uppercase tracking-wider text-subtle">Danceability</div>
                <div className="mt-0.5 font-display text-sm font-bold text-cream">88 / 100</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-elevated p-2">
                <div className="text-[10px] uppercase tracking-wider text-subtle">Energy Peak</div>
                <div className="mt-0.5 font-display text-sm font-bold text-accent">76 / 100</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-elevated p-2">
                <div className="text-[10px] uppercase tracking-wider text-subtle">Vibe Positivity</div>
                <div className="mt-0.5 font-display text-sm font-bold text-cream">64 / 100</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 30s Audio Player Preview View */}
        {activeTab === 'player' && (
          <div className="mt-5 space-y-4 animate-rise">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-black">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </span>
                <span className="text-xs font-semibold text-accent">30s Streaming Audio Preview</span>
              </div>
              <EqBars className="text-accent" />
            </div>

            {/* Simulated Live Track Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-elevated to-panel p-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-black shadow-md">
                  <Radio className="h-6 w-6 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-display text-sm font-bold text-cream">
                    Solaris Pulse (Extended Mix)
                  </h4>
                  <p className="truncate text-xs text-muted">Aether Echo · Deep Resonance LP</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-accent">
                    <span className="rounded bg-accent/15 px-1.5 py-0.2 font-mono">128 BPM</span>
                    <span className="text-subtle">·</span>
                    <span className="text-muted">Rank #1 Most Played</span>
                  </div>
                </div>
              </div>

              {/* Progress Scrub Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-subtle">
                  <span>0:14</span>
                  <span>0:30 Preview</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[46%] rounded-full bg-accent transition-all duration-300" />
                </div>
              </div>

              {/* Mock Controls */}
              <div className="mt-3 flex items-center justify-between text-xs text-subtle">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted" />
                  <div className="h-1.5 w-16 rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-cream" />
                  </div>
                </div>
                <span className="text-[11px] text-muted font-medium">Instant Keyboard Shortcut (Space)</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-elevated/80 p-3 text-xs text-muted flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent mt-0.5" />
              <span>
                Stream 30-second audio snippets directly across Top Tracks, Recently Played, and Recommendation mixes without leaving the page.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Sonic Archetype Analysis View */}
        {activeTab === 'archetype' && (
          <div className="mt-5 space-y-4 animate-rise">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                <Sparkles className="h-3 w-3" />
                Sonic Archetype Classification
              </span>
              <span className="text-xs font-mono text-muted">98.4% Match</span>
            </div>

            <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/15 via-elevated to-panel p-5">
              <div className="flex items-center gap-2 text-accent">
                <Flame className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Identified Archetype</span>
              </div>
              <h4 className="mt-1 font-display text-xl font-bold text-cream">
                High-Octane Party Catalyst
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Your listening profile is dominated by high-tempo energetic rhythms, driving basslines, and euphoric danceability peaks. You gravitate toward festival anthems and peak-time momentum.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-lg bg-black/40 p-2.5">
                  <div className="text-[10px] text-subtle uppercase tracking-wider">Key Vibe</div>
                  <div className="mt-0.5 text-xs font-semibold text-cream">Energetic & Upbeat</div>
                </div>
                <div className="rounded-lg bg-black/40 p-2.5">
                  <div className="text-[10px] text-subtle uppercase tracking-wider">Top Subgenres</div>
                  <div className="mt-0.5 text-xs font-semibold text-cream">House · Melodic Techno</div>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-subtle">
              Calculated dynamically using Spotify acoustic vectors and genre clustering.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
