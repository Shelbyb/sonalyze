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
    description:
      'Measures tempo regularity, rhythm strength, and beat stability suitable for movement.',
  },
  {
    name: 'Energy',
    value: '76%',
    description:
      'Dynamic perceptual measure of intensity, loudness, dynamic range, and active timbre.',
  },
  {
    name: 'Valence (Mood)',
    value: '64%',
    description:
      'Musical positiveness conveying feelings of euphoria and optimism versus melancholia.',
  },
  {
    name: 'Acousticness',
    value: '18%',
    description:
      'Confidence score measuring the presence of acoustic instrumentation versus synthesizers.',
  },
  {
    name: 'Camelot Harmonic Key',
    value: '8B / C-Maj',
    description:
      'Harmonic mixing notation to match complementary pitch structures and DJ transitions.',
  },
  {
    name: 'Tempo & Loudness',
    value: '124 BPM · -5.8 dB',
    description:
      'Exact rhythmic pulse rate and master perceived loudness curve in decibels (LUFS/dB).',
  },
];

const archetypes = [
  {
    title: 'High-Octane Party Catalyst',
    badge: 'High Energy · Dance Heavy',
    description:
      'Dominated by high-tempo driving basslines, peak-hour energy, and club anthems that keep rooms moving.',
    icon: Flame,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-accent',
  },
  {
    title: 'Deep Flow Architect',
    badge: 'Instrumental · Low Distraction',
    description:
      'Gravitates toward steady electronic polyrhythms, ambient soundscapes, and focus-enhancing compositions.',
    icon: Layers,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
  },
  {
    title: 'Radiant Mood Uplifter',
    badge: 'High Valence · Euphoric Melodies',
    description:
      'A cheerful, bright palette of warm chords, singable hooks, and infectious positive harmonies.',
    icon: Sparkles,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
  },
  {
    title: 'Late-Night Dreamweaver',
    badge: 'Atmospheric · Subdued Tempo',
    description:
      'Introspective, reverb-drenched melancholia and nocturnal textures suited for midnight contemplation.',
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
    <main className="bg-base text-cream selection:bg-accent relative min-h-screen overflow-x-clip selection:text-black">
      {/* Background ambient light effects */}
      <div className="bg-radial-fade pointer-events-none absolute inset-x-0 top-0 h-[1000px] opacity-80" />
      <div className="bg-accent/10 pointer-events-none absolute top-[600px] -left-64 h-[500px] w-[500px] rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-[1200px] -right-64 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[160px]" />

      {/* Top Navbar */}
      <header className="bg-base/80 sticky top-0 z-50 border-b border-white/8 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="bg-accent shadow-accent/20 flex h-9 w-9 items-center justify-center rounded-xl text-black shadow-lg transition-transform group-hover:scale-105">
                <Waves className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-cream text-lg font-bold tracking-tight">
                  Sonalyze
                </span>
                <span className="text-accent font-mono text-[10px] leading-none font-semibold tracking-widest uppercase">
                  Audio Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="text-muted hidden items-center gap-5 text-xs font-medium md:flex">
              <a href="#features" className="hover:text-cream transition-colors">
                Features
              </a>
              <a href="#audio-dna" className="hover:text-cream transition-colors">
                Audio DNA
              </a>
              <a href="#archetypes" className="hover:text-cream transition-colors">
                Archetypes
              </a>
              <a href="#how-it-works" className="hover:text-cream transition-colors">
                How It Works
              </a>
              <a href="#security" className="hover:text-cream transition-colors">
                Security
              </a>
              <a href="#faq" className="hover:text-cream transition-colors">
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-elevated text-subtle hidden items-center gap-1.5 rounded-full border border-white/8 px-2.5 py-1 text-[11px] font-medium sm:inline-flex">
              <span className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" />
              <span>Spotify Web API v1</span>
            </div>
            <LoginButton size="md" label="Log in with Spotify" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-12 pb-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16 lg:pb-28">
        <div className="animate-rise space-y-6">
          <div className="border-accent/20 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm">
            <EqBars className="text-accent" />
            <span>Real-Time Spotify Audio Intelligence</span>
          </div>

          <h1 className="font-display text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-[4.2rem]">
            See the shape <br className="hidden sm:inline" />
            of your{' '}
            <span className="bg-gradient-to-r from-[#1ed760] via-[#5eead4] to-[#f5f3ee] bg-clip-text text-transparent">
              sound.
            </span>
          </h1>

          <p className="text-muted max-w-xl text-lg leading-relaxed">
            Transform your Spotify listening history into interactive visual intelligence.
            Explore 30-second audio previews, multi-dimensional Audio DNA radar
            signatures, sonic archetype personas, and generate curated mixes synced
            straight to your library.
          </p>

          <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center">
            <LoginButton size="lg" label="Log in with Spotify" />
            <a
              href="#features"
              className="bg-elevated/80 text-cream hover:border-accent/40 hover:bg-elevated hover:text-accent inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-4 text-sm font-semibold transition-all duration-300"
            >
              <span>Explore Features</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="text-subtle flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/8 pt-2 text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="text-accent h-4 w-4" />
              100% Stateless OAuth 2.0
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="text-accent h-4 w-4" />
              No Database Tracking
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="text-accent h-4 w-4" />
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
      <section className="bg-panel/50 relative z-10 border-y border-white/8 py-10 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 sm:px-8 md:grid-cols-4">
          <div className="bg-elevated/40 rounded-2xl border border-white/5 p-5 text-center">
            <div className="font-display text-accent text-3xl font-extrabold">30s</div>
            <div className="text-cream mt-1 text-xs font-semibold tracking-wider uppercase">
              Audio Previews
            </div>
            <p className="text-subtle mt-1 text-xs">Inline streaming samples</p>
          </div>
          <div className="bg-elevated/40 rounded-2xl border border-white/5 p-5 text-center">
            <div className="font-display text-cream text-3xl font-extrabold">9+</div>
            <div className="text-cream mt-1 text-xs font-semibold tracking-wider uppercase">
              Audio Dimensions
            </div>
            <p className="text-subtle mt-1 text-xs">Radar feature vectors</p>
          </div>
          <div className="bg-elevated/40 rounded-2xl border border-white/5 p-5 text-center">
            <div className="font-display text-accent text-3xl font-extrabold">3</div>
            <div className="text-cream mt-1 text-xs font-semibold tracking-wider uppercase">
              Time Horizons
            </div>
            <p className="text-subtle mt-1 text-xs">4 weeks, 6 months, all-time</p>
          </div>
          <div className="bg-elevated/40 rounded-2xl border border-white/5 p-5 text-center">
            <div className="font-display text-cream text-3xl font-extrabold">0</div>
            <div className="text-cream mt-1 text-xs font-semibold tracking-wider uppercase">
              Server Databases
            </div>
            <p className="text-subtle mt-1 text-xs">Encrypted client sessions</p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <span className="bg-accent/10 text-accent inline-block rounded-md px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Platform Features
            </span>
            <h2 className="font-display text-cream mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your ears have been up to.
            </h2>
            <p className="text-muted mt-4 text-base leading-relaxed">
              Deep catalog analytics, acoustic radar telemetry, live preview audio
              streams, and intelligent tools that decode your musical taste.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, tag, body }) => (
              <div
                key={title}
                className="group bg-panel/60 hover:border-accent/40 hover:bg-panel hover:shadow-accent/5 relative flex flex-col justify-between rounded-2xl border border-white/8 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="bg-elevated text-accent group-hover:bg-accent flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:text-black">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-subtle rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-display text-cream group-hover:text-accent text-lg font-bold tracking-tight transition-colors">
                    {title}
                  </h3>
                  <p className="text-muted mt-2.5 text-xs leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audio DNA Showcase Section */}
      <section
        id="audio-dna"
        className="bg-panel/30 relative z-10 border-t border-white/8 py-24 backdrop-blur sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <span className="bg-accent/10 text-accent inline-block rounded-md px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
                Audio Intelligence
              </span>
              <h2 className="font-display text-cream mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                The acoustic science inside every track.
              </h2>
              <p className="text-muted mt-4 text-base leading-relaxed">
                Spotify extracts deep computational audio signals for millions of
                recordings. Sonalyze pulls these vectors directly into clean, interactive
                radar visualizers so you can compare musical traits across tracks,
                artists, and playlists.
              </p>

              <div className="mt-8 space-y-4">
                <div className="bg-elevated/60 flex items-start gap-3.5 rounded-xl border border-white/5 p-4">
                  <Radar className="text-accent mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="text-cream text-sm font-semibold">
                      Interactive Radar Modals
                    </h4>
                    <p className="text-muted mt-1 text-xs">
                      Click the radar icon on any song to inspect its exact acoustic
                      geometry in real time.
                    </p>
                  </div>
                </div>
                <div className="bg-elevated/60 flex items-start gap-3.5 rounded-xl border border-white/5 p-4">
                  <Sliders className="text-accent mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="text-cream text-sm font-semibold">
                      Harmonic Key & BPM Matching
                    </h4>
                    <p className="text-muted mt-1 text-xs">
                      Discover Camelot keys and exact tempo markers to find songs that
                      blend together seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio DNA Metric Cards */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {audioDnaFeatures.map((feat) => (
                <div
                  key={feat.name}
                  className="bg-elevated/70 hover:border-accent/30 hover:bg-elevated rounded-2xl border border-white/8 p-5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                      {feat.name}
                    </span>
                    <span className="text-accent font-mono text-sm font-bold">
                      {feat.value}
                    </span>
                  </div>
                  <p className="text-subtle mt-2 text-xs leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sonic Archetypes Section */}
      <section id="archetypes" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="bg-accent/10 text-accent inline-block rounded-md px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Taste Profiler
            </span>
            <h2 className="font-display text-cream mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Discover your Sonic Archetype.
            </h2>
            <p className="text-muted mt-4 text-base leading-relaxed">
              Sonalyze categorizes your listening fingerprint into one of 10+ distinct
              algorithmic taste personas based on acoustic weight and genre momentum.
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
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-cream/80 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                        {arch.badge}
                      </span>
                    </div>
                    <h3 className="font-display text-cream text-lg font-bold">
                      {arch.title}
                    </h3>
                    <p className="text-muted mt-2 text-xs leading-relaxed">
                      {arch.description}
                    </p>
                  </div>
                  <div className="text-subtle mt-6 flex items-center justify-between border-t border-white/5 pt-4 font-mono text-[11px]">
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
      <section
        id="how-it-works"
        className="bg-panel/40 relative z-10 border-t border-white/8 py-24 backdrop-blur sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <span className="bg-accent/10 text-accent inline-block rounded-md px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Flow
            </span>
            <h2 className="font-display text-cream mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From login to playlist in three steps.
            </h2>
            <p className="text-muted mt-4 text-base leading-relaxed">
              Fast, zero friction, and instant results directly connected to your Spotify
              library.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map(({ icon: Icon, step, title, body }) => (
              <div
                key={title}
                className="group bg-elevated/60 hover:border-accent/40 hover:bg-elevated relative rounded-3xl border border-white/8 p-8 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display group-hover:text-accent/30 text-4xl font-extrabold text-white/10 transition-colors">
                    {step}
                  </span>
                  <div className="bg-panel text-accent flex h-11 w-11 items-center justify-center rounded-xl border border-white/5">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="font-display text-cream mt-6 text-lg font-bold tracking-tight">
                  {title}
                </h3>
                <p className="text-muted mt-3 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Pillars */}
      <section id="security" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <span className="bg-accent/10 text-accent inline-block rounded-md px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Security & Privacy
            </span>
            <h2 className="font-display text-cream mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Private by design. No compromises.
            </h2>
            <p className="text-muted mt-4 text-base leading-relaxed">
              Sonalyze was engineered with zero server databases. Your listening data
              belongs exclusively to you and Spotify.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {securityPillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-panel/50 rounded-2xl border border-white/8 p-6 backdrop-blur"
              >
                <div className="bg-accent/10 text-accent mb-5 flex h-11 w-11 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-cream text-base font-bold">{title}</h3>
                <p className="text-muted mt-2.5 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="bg-panel/30 relative z-10 border-t border-white/8 py-24 backdrop-blur sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="bg-accent/10 text-accent inline-block rounded-md px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Questions & Answers
            </span>
            <h2 className="font-display text-cream mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions.
            </h2>
            <p className="text-muted mt-4 text-base leading-relaxed">
              Everything you need to know about Sonalyze, audio metrics, and Spotify
              authentication.
            </p>
          </div>

          <LandingFaq />
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 pt-10 pb-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="border-accent/40 from-accent/20 via-panel to-panel shadow-accent/10 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-10 shadow-2xl sm:p-16">
            {/* Glow effect */}
            <div className="bg-accent/20 pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <span className="bg-accent/20 text-accent mb-4 inline-block rounded-md px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                Instant Discovery
              </span>
              <h2 className="font-display text-cream text-3xl font-extrabold tracking-tight sm:text-5xl">
                Ready to explore your listening DNA?
              </h2>
              <p className="text-muted mt-4 text-base leading-relaxed sm:text-lg">
                Connect with Spotify in one click to unlock your ranked artists, 30-second
                streaming previews, audio DNA radar charts, and custom playlist
                recommendations.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <LoginButton size="lg" label="Log in with Spotify" />
                <span className="text-subtle flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="text-accent h-4 w-4" />
                  Instant access · No password stored · Free forever
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base text-subtle relative z-10 border-t border-white/8 py-12 text-xs">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent flex h-7 w-7 items-center justify-center rounded-lg font-bold text-black">
              <Waves className="h-4 w-4" />
            </div>
            <span className="font-display text-cream text-sm font-bold">Sonalyze</span>
            <span className="text-subtle">
              · Spotify Listening Visualizer & Audio Intelligence
            </span>
          </div>

          <div className="text-muted flex flex-wrap items-center gap-5">
            <a href="#features" className="hover:text-cream transition-colors">
              Features
            </a>
            <a href="#audio-dna" className="hover:text-cream transition-colors">
              Audio DNA
            </a>
            <a href="#security" className="hover:text-cream transition-colors">
              Security
            </a>
            <a href="#faq" className="hover:text-cream transition-colors">
              FAQ
            </a>
            <Link
              href="/api/health"
              target="_blank"
              className="hover:text-cream flex items-center gap-1 transition-colors"
            >
              <span>Status</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="text-subtle text-left text-[11px] md:text-right">
            <p>Not affiliated with or endorsed by Spotify AB.</p>
            <p className="mt-0.5">Built with Next.js 16, React 19 & Tailwind CSS v4.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
