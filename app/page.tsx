import Link from 'next/link';
import {
  BarChart3,
  Music2,
  History,
  Radar,
  Compass,
  Wand2,
  FileSpreadsheet,
  Zap,
  ShieldCheck,
  Waves,
  ArrowRight,
  Link2,
  Sparkles,
  Lock,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
  Layers,
  Activity,
  Globe2,
  ExternalLink,
} from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import EqBars from '@/components/EqBars';
import LandingHeroPreview from '@/components/LandingHeroPreview';
import LandingFaq from '@/components/LandingFaq';

const capabilities = [
  {
    icon: Music2,
    title: 'Top tracks & previews',
    tag: 'Audio Streaming',
    body: 'Your ranked heavy rotation tracks with integrated 30s streaming audio previews, popularity gauges, and instant audio DNA radar modals.',
  },
  {
    icon: BarChart3,
    title: 'Top artists',
    tag: 'Catalog Analysis',
    body: 'The acts and creators you actually played on repeat, dynamically filtered across 4 weeks, 6 months, or your entire listening history.',
  },
  {
    icon: Radar,
    title: 'Audio DNA',
    tag: 'Acoustic Science',
    body: 'Every track deconstructed into 9+ acoustic dimensions: Danceability, Energy, Valence, Acousticness, Instrumentalness, Tempo (BPM), and Camelot Key.',
  },
  {
    icon: Compass,
    title: 'Taste profile',
    tag: 'Behavioral Insights',
    body: 'Your genre distribution and sonic archetype classified into an explorable persona card with emotional valence and acoustic signatures.',
  },
  {
    icon: History,
    title: 'Recently played',
    tag: 'Live Timeline',
    body: 'A real-time scrollable history log of your last 50 plays with exact timestamps, duration metrics, and 1-click preview playback.',
  },
  {
    icon: Wand2,
    title: 'Playlist generator',
    tag: 'Smart Synthesis',
    body: 'Select any playlist in your library as a seed, adjust energy and danceability sliders, generate 20 tailored recommendations, and export directly to Spotify.',
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV Data Export',
    tag: 'Portability',
    body: 'One-click spreadsheet download of your ranked tracks, listening history, and audio metrics for data science and personal archiving.',
  },
  {
    icon: Zap,
    title: 'Sub-Millisecond Caching',
    tag: 'Performance',
    body: 'In-memory client-side cache and in-flight request deduplication with exponential backoff for instant tab switching with zero lag.',
  },
];

const audioDnaFeatures = [
  {
    name: 'Danceability',
    value: '88%',
    description: 'Measures tempo regularity, rhythm strength, and beat stability suitable for movement.',
  },
  {
    name: 'Energy',
    value: '76%',
    description: 'Dynamic perceptual measure of intensity, loudness, dynamic range, and active timbre.',
  },
  {
    name: 'Valence (Mood)',
    value: '64%',
    description: 'Musical positiveness conveying feelings of euphoria and optimism versus melancholia.',
  },
  {
    name: 'Acousticness',
    value: '18%',
    description: 'Confidence score measuring the presence of acoustic instrumentation versus synthesizers.',
  },
  {
    name: 'Camelot Harmonic Key',
    value: '8B / C-Maj',
    description: 'Harmonic mixing notation to match complementary pitch structures and DJ transitions.',
  },
  {
    name: 'Tempo & Loudness',
    value: '124 BPM · -5.8 dB',
    description: 'Exact rhythmic pulse rate and master perceived loudness curve in decibels (LUFS/dB).',
  },
];

const archetypes = [
  {
    title: 'High-Octane Party Catalyst',
    badge: 'High Energy · Dance Heavy',
    description: 'Dominated by high-tempo driving basslines, peak-hour energy, and club anthems that keep rooms moving.',
    icon: Flame,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-accent',
  },
  {
    title: 'Deep Flow Architect',
    badge: 'Instrumental · Low Distraction',
    description: 'Gravitates toward steady electronic polyrhythms, ambient soundscapes, and focus-enhancing compositions.',
    icon: Layers,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
  },
  {
    title: 'Radiant Mood Uplifter',
    badge: 'High Valence · Euphoric Melodies',
    description: 'A cheerful, bright palette of warm chords, singable hooks, and infectious positive harmonies.',
    icon: Sparkles,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
  },
  {
    title: 'Late-Night Dreamweaver',
    badge: 'Atmospheric · Subdued Tempo',
    description: 'Introspective, reverb-drenched melancholia and nocturnal textures suited for midnight contemplation.',
    icon: Radio,
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
  },
];

const steps = [
  {
    icon: Link2,
    step: '01',
    title: 'Connect your account',
    body: 'Authenticate via official Spotify OAuth 2.0 PKCE. We only request read scopes for your listening history and permission to save generated playlists.',
  },
  {
    icon: Compass,
    step: '02',
    title: 'Explore & preview data',
    body: 'Browse your heavy rotation, listen to 30s audio preview samples, view acoustic radar charts, and discover your Sonic Archetype.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Build something new',
    body: 'Feed any playlist into our recommendation engine, tune energy and vibe parameters, and save tailored mixes directly into your Spotify library.',
  },
];

const securityPillars = [
  {
    icon: ShieldCheck,
    title: '100% Stateless Sessions',
    body: 'Zero server databases. Authentication tokens are encrypted in client-side HTTP-only cookies signed by NextAuth.',
  },
  {
    icon: Lock,
    title: 'Strict Content Security Policy',
    body: 'Hardened HTTP headers, TLS encryption, and restrictive CSP blocking all unverified external connections.',
  },
  {
    icon: Globe2,
    title: 'Direct Spotify API Only',
    body: 'All data queries communicate directly between your browser and official Spotify endpoints (api.spotify.com).',
  },
  {
    icon: CheckCircle2,
    title: 'Instant 1-Click Revocation',
    body: 'Easily disconnect access at any time through your Spotify Account Settings with zero lingering data.',
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-base text-cream selection:bg-accent selection:text-black">
      {/* Background ambient light effects */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1000px] bg-radial-fade opacity-80" />
      <div className="pointer-events-none absolute top-[600px] -left-64 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-[1200px] -right-64 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[160px]" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-base/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-black shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
                <Waves className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold tracking-tight text-cream">Sonalyze</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold leading-none">
                  Audio Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-muted">
              <a href="#features" className="transition-colors hover:text-cream">Features</a>
              <a href="#audio-dna" className="transition-colors hover:text-cream">Audio DNA</a>
              <a href="#archetypes" className="transition-colors hover:text-cream">Archetypes</a>
              <a href="#how-it-works" className="transition-colors hover:text-cream">How It Works</a>
              <a href="#security" className="transition-colors hover:text-cream">Security</a>
              <a href="#faq" className="transition-colors hover:text-cream">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-elevated px-2.5 py-1 text-[11px] font-medium text-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>Spotify Web API v1</span>
            </div>
            <LoginButton size="md" label="Log in with Spotify" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16 lg:pb-28">
        <div className="animate-rise space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent shadow-sm">
            <EqBars className="text-accent" />
            <span>Real-Time Spotify Audio Intelligence</span>
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            See the shape{' '}
            <br className="hidden sm:inline" />
            of your <span className="bg-gradient-to-r from-[#1ed760] via-[#5eead4] to-[#f5f3ee] bg-clip-text text-transparent">sound.</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted">
            Transform your Spotify listening history into interactive visual intelligence. Explore 30-second audio previews, multi-dimensional Audio DNA radar signatures, sonic archetype personas, and generate curated mixes synced straight to your library.
          </p>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center pt-2">
            <LoginButton size="lg" label="Log in with Spotify" />
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-elevated/80 px-6 py-4 text-sm font-semibold text-cream transition-all duration-300 hover:border-accent/40 hover:bg-elevated hover:text-accent"
            >
              <span>Explore Features</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-subtle border-t border-white/8">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              100% Stateless OAuth 2.0
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-accent" />
              No Database Tracking
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Free & Open Source
            </span>
          </div>
        </div>

        {/* Hero Interactive Showcase Card */}
        <div className="relative">
          <LandingHeroPreview />
        </div>
      </section>

      {/* Metrics & Capabilities Bar */}
      <section className="relative z-10 border-y border-white/8 bg-panel/50 py-10 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 sm:px-8 md:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-elevated/40 p-5 text-center">
            <div className="font-display text-3xl font-extrabold text-accent">30s</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-cream">Audio Previews</div>
            <p className="mt-1 text-xs text-subtle">Inline streaming samples</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-elevated/40 p-5 text-center">
            <div className="font-display text-3xl font-extrabold text-cream">9+</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-cream">Audio Dimensions</div>
            <p className="mt-1 text-xs text-subtle">Radar feature vectors</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-elevated/40 p-5 text-center">
            <div className="font-display text-3xl font-extrabold text-accent">3</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-cream">Time Horizons</div>
            <p className="mt-1 text-xs text-subtle">4 weeks, 6 months, all-time</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-elevated/40 p-5 text-center">
            <div className="font-display text-3xl font-extrabold text-cream">0</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-cream">Server Databases</div>
            <p className="mt-1 text-xs text-subtle">Encrypted client sessions</p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Platform Features
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-cream">
              Everything your ears have been up to.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Deep catalog analytics, acoustic radar telemetry, live preview audio streams, and intelligent tools that decode your musical taste.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, tag, body }) => (
              <div
                key={title}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/8 bg-panel/60 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:bg-panel hover:shadow-xl hover:shadow-accent/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-elevated text-accent transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-black">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-subtle rounded-md bg-white/5 px-2 py-0.5">
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-cream group-hover:text-accent transition-colors">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audio DNA Showcase Section */}
      <section id="audio-dna" className="relative z-10 border-t border-white/8 bg-panel/30 py-24 sm:py-32 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] items-center">
            <div>
              <span className="inline-block rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Audio Intelligence
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-cream">
                The acoustic science inside every track.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                Spotify extracts deep computational audio signals for millions of recordings. Sonalyze pulls these vectors directly into clean, interactive radar visualizers so you can compare musical traits across tracks, artists, and playlists.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5 rounded-xl border border-white/5 bg-elevated/60 p-4">
                  <Radar className="h-5 w-5 shrink-0 text-accent mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-cream">Interactive Radar Modals</h4>
                    <p className="mt-1 text-xs text-muted">Click the radar icon on any song to inspect its exact acoustic geometry in real time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 rounded-xl border border-white/5 bg-elevated/60 p-4">
                  <Sliders className="h-5 w-5 shrink-0 text-accent mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-cream">Harmonic Key & BPM Matching</h4>
                    <p className="mt-1 text-xs text-muted">Discover Camelot keys and exact tempo markers to find songs that blend together seamlessly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio DNA Metric Cards */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {audioDnaFeatures.map((feat) => (
                <div
                  key={feat.name}
                  className="rounded-2xl border border-white/8 bg-elevated/70 p-5 transition-colors hover:border-accent/30 hover:bg-elevated"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">{feat.name}</span>
                    <span className="font-mono text-sm font-bold text-accent">{feat.value}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-subtle">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sonic Archetypes Section */}
      <section id="archetypes" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Taste Profiler
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-cream">
              Discover your Sonic Archetype.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Sonalyze categorizes your listening fingerprint into one of 10+ distinct algorithmic taste personas based on acoustic weight and genre momentum.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {archetypes.map((arch) => {
              const Icon = arch.icon;
              return (
                <div
                  key={arch.title}
                  className={`relative flex flex-col justify-between rounded-3xl border bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-1 ${arch.color}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full text-cream/80">
                        {arch.badge}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-cream">{arch.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{arch.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-subtle flex items-center justify-between">
                    <span>Algorithmic Profile</span>
                    <span className="text-cream font-bold">100% Tailored</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 border-t border-white/8 bg-panel/40 py-24 sm:py-32 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Flow
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-cream">
              From login to playlist in three steps.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Fast, zero friction, and instant results directly connected to your Spotify library.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map(({ icon: Icon, step, title, body }) => (
              <div
                key={title}
                className="group relative rounded-3xl border border-white/8 bg-elevated/60 p-8 transition-all duration-300 hover:border-accent/40 hover:bg-elevated"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-extrabold text-white/10 group-hover:text-accent/30 transition-colors">
                    {step}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-panel text-accent border border-white/5">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-lg font-bold tracking-tight text-cream">{title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Pillars */}
      <section id="security" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Security & Privacy
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-cream">
              Private by design. No compromises.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Sonalyze was engineered with zero server databases. Your listening data belongs exclusively to you and Spotify.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {securityPillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/8 bg-panel/50 p-6 backdrop-blur"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-cream">{title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 border-t border-white/8 bg-panel/30 py-24 sm:py-32 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Questions & Answers
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-cream">
              Frequently asked questions.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Everything you need to know about Sonalyze, audio metrics, and Spotify authentication.
            </p>
          </div>

          <LandingFaq />
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 pb-28 pt-10">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-accent/40 bg-gradient-to-br from-accent/20 via-panel to-panel p-10 sm:p-16 shadow-2xl shadow-accent/10">
            {/* Glow effect */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-block rounded-md bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent mb-4">
                Instant Discovery
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl text-cream">
                Ready to explore your listening DNA?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
                Connect with Spotify in one click to unlock your ranked artists, 30-second streaming previews, audio DNA radar charts, and custom playlist recommendations.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <LoginButton size="lg" label="Log in with Spotify" />
                <span className="text-xs text-subtle flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Instant access · No password stored · Free forever
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 bg-base py-12 text-xs text-subtle">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-black font-bold">
              <Waves className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-bold text-cream">Sonalyze</span>
            <span className="text-subtle">· Spotify Listening Visualizer & Audio Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-muted">
            <a href="#features" className="hover:text-cream transition-colors">Features</a>
            <a href="#audio-dna" className="hover:text-cream transition-colors">Audio DNA</a>
            <a href="#security" className="hover:text-cream transition-colors">Security</a>
            <a href="#faq" className="hover:text-cream transition-colors">FAQ</a>
            <Link href="/api/health" target="_blank" className="hover:text-cream transition-colors flex items-center gap-1">
              <span>Status</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="text-left md:text-right text-[11px] text-subtle">
            <p>Not affiliated with or endorsed by Spotify AB.</p>
            <p className="mt-0.5">Built with Next.js 16, React 19 & Tailwind CSS v4.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
