'use client';

import { useState } from 'react';
import { Play, Volume2, Sparkles, Flame, Radio, CheckCircle2 } from 'lucide-react';
import EqBars from './EqBars';

export default function LandingHeroPreview() {
  const [activeTab, setActiveTab] = useState<'radar' | 'player' | 'archetype'>('radar');

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Glow backdrop behind preview card */}
      <div className="from-accent/30 pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r via-emerald-500/20 to-teal-400/20 opacity-70 blur-xl transition-all duration-500 group-hover:opacity-100" />

      {/* Main glass card container */}
      <div className="bg-panel/90 relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        {/* Top Header / Switcher */}
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-3 w-3 items-center justify-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-accent relative inline-flex h-2.5 w-2.5 rounded-full" />
              </span>
            </div>
            <span className="text-muted text-xs font-semibold tracking-wider uppercase">
              Live Audio Telemetry
            </span>
          </div>

          {/* Tab Selector */}
          <div className="bg-elevated flex items-center gap-1 rounded-full border border-white/8 p-1 text-xs">
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
          <div className="animate-rise mt-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-accent/15 text-accent inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold">
                  Multi-Dimensional DNA
                </span>
                <h4 className="font-display text-cream mt-1 text-lg font-bold">
                  Electronic & Indie Dance Fingerprint
                </h4>
                <p className="text-muted text-xs">
                  Averaged from your top 50 heavy-rotation tracks
                </p>
              </div>
              <div className="text-right">
                <div className="text-subtle text-xs">Sonic Tempo</div>
                <div className="font-display text-accent text-base font-bold">
                  124 BPM
                </div>
              </div>
            </div>

            {/* Visual SVG Radar polygon simulation */}
            <div className="bg-elevated/60 relative flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-white/5 p-4">
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
                <line
                  x1="100"
                  y1="20"
                  x2="100"
                  y2="180"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <line
                  x1="31"
                  y1="60"
                  x2="169"
                  y2="140"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <line
                  x1="31"
                  y1="140"
                  x2="169"
                  y2="60"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />

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
                <text
                  x="100"
                  y="14"
                  textAnchor="middle"
                  fill="#f5f3ee"
                  fontSize="8"
                  fontWeight="600"
                >
                  Dance (88%)
                </text>
                <text x="180" y="62" textAnchor="start" fill="#a7a7a7" fontSize="7.5">
                  Energy (76%)
                </text>
                <text x="178" y="146" textAnchor="start" fill="#a7a7a7" fontSize="7.5">
                  Valence (64%)
                </text>
                <text x="100" y="194" textAnchor="middle" fill="#a7a7a7" fontSize="7.5">
                  Acoustic (18%)
                </text>
                <text x="24" y="146" textAnchor="end" fill="#a7a7a7" fontSize="7.5">
                  Speech (12%)
                </text>
                <text x="24" y="62" textAnchor="end" fill="#a7a7a7" fontSize="7.5">
                  Liveness (32%)
                </text>
              </svg>

              {/* Floating key tag */}
              <div className="bg-panel/80 text-cream absolute right-3 bottom-3 rounded-lg border border-white/8 px-2.5 py-1 font-mono text-[11px] backdrop-blur">
                Camelot Key: <span className="text-accent font-bold">8B (C Major)</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-elevated rounded-xl border border-white/5 p-2">
                <div className="text-subtle text-[10px] tracking-wider uppercase">
                  Danceability
                </div>
                <div className="font-display text-cream mt-0.5 text-sm font-bold">
                  88 / 100
                </div>
              </div>
              <div className="bg-elevated rounded-xl border border-white/5 p-2">
                <div className="text-subtle text-[10px] tracking-wider uppercase">
                  Energy Peak
                </div>
                <div className="font-display text-accent mt-0.5 text-sm font-bold">
                  76 / 100
                </div>
              </div>
              <div className="bg-elevated rounded-xl border border-white/5 p-2">
                <div className="text-subtle text-[10px] tracking-wider uppercase">
                  Vibe Positivity
                </div>
                <div className="font-display text-cream mt-0.5 text-sm font-bold">
                  64 / 100
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 30s Audio Player Preview View */}
        {activeTab === 'player' && (
          <div className="animate-rise mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-accent flex h-6 w-6 items-center justify-center rounded-full text-black">
                  <Play className="ml-0.5 h-3 w-3 fill-current" />
                </span>
                <span className="text-accent text-xs font-semibold">
                  30s Streaming Audio Preview
                </span>
              </div>
              <EqBars className="text-accent" />
            </div>

            {/* Simulated Live Track Card */}
            <div className="from-elevated to-panel rounded-2xl border border-white/10 bg-gradient-to-br p-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-black shadow-md">
                  <Radio className="text-accent h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-cream truncate text-sm font-bold">
                    Solaris Pulse (Extended Mix)
                  </h4>
                  <p className="text-muted truncate text-xs">
                    Aether Echo · Deep Resonance LP
                  </p>
                  <div className="text-accent mt-1.5 flex items-center gap-2 text-[11px]">
                    <span className="bg-accent/15 py-0.2 rounded px-1.5 font-mono">
                      128 BPM
                    </span>
                    <span className="text-subtle">·</span>
                    <span className="text-muted">Rank #1 Most Played</span>
                  </div>
                </div>
              </div>

              {/* Progress Scrub Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="text-subtle flex justify-between font-mono text-[10px]">
                  <span>0:14</span>
                  <span>0:30 Preview</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="bg-accent h-full w-[46%] rounded-full transition-all duration-300" />
                </div>
              </div>

              {/* Mock Controls */}
              <div className="text-subtle mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="text-muted h-4 w-4" />
                  <div className="h-1.5 w-16 rounded-full bg-white/10">
                    <div className="bg-cream h-full w-3/4 rounded-full" />
                  </div>
                </div>
                <span className="text-muted text-[11px] font-medium">
                  Instant Keyboard Shortcut (Space)
                </span>
              </div>
            </div>

            <div className="bg-elevated/80 text-muted flex items-start gap-2.5 rounded-xl border border-white/5 p-3 text-xs">
              <CheckCircle2 className="text-accent mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Stream 30-second audio snippets directly across Top Tracks, Recently
                Played, and Recommendation mixes without leaving the page.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Sonic Archetype Analysis View */}
        {activeTab === 'archetype' && (
          <div className="animate-rise mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-accent inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold">
                <Sparkles className="h-3 w-3" />
                Sonic Archetype Classification
              </span>
              <span className="text-muted font-mono text-xs">98.4% Match</span>
            </div>

            <div className="border-accent/25 from-accent/15 via-elevated to-panel rounded-2xl border bg-gradient-to-br p-5">
              <div className="text-accent flex items-center gap-2">
                <Flame className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wider uppercase">
                  Identified Archetype
                </span>
              </div>
              <h4 className="font-display text-cream mt-1 text-xl font-bold">
                High-Octane Party Catalyst
              </h4>
              <p className="text-muted mt-2 text-xs leading-relaxed">
                Your listening profile is dominated by high-tempo energetic rhythms,
                driving basslines, and euphoric danceability peaks. You gravitate toward
                festival anthems and peak-time momentum.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-lg bg-black/40 p-2.5">
                  <div className="text-subtle text-[10px] tracking-wider uppercase">
                    Key Vibe
                  </div>
                  <div className="text-cream mt-0.5 text-xs font-semibold">
                    Energetic & Upbeat
                  </div>
                </div>
                <div className="rounded-lg bg-black/40 p-2.5">
                  <div className="text-subtle text-[10px] tracking-wider uppercase">
                    Top Subgenres
                  </div>
                  <div className="text-cream mt-0.5 text-xs font-semibold">
                    House · Melodic Techno
                  </div>
                </div>
              </div>
            </div>

            <p className="text-subtle text-center text-[11px]">
              Calculated dynamically using Spotify acoustic vectors and genre clustering.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
