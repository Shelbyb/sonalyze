import {
  ListMusic,
  History,
  Radar,
  Sparkles,
  BarChart3,
  Music2,
  ShieldCheck,
  Waves,
  ArrowRight,
  Link2,
  Compass,
  Wand2,
  Volume2,
} from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import AlbumMosaic from '@/components/AlbumMosaic';
import EqBars from '@/components/EqBars';

const features = [
  {
    icon: BarChart3,
    title: 'Top artists',
    body: 'The acts you actually played on repeat, ranked across four weeks, six months, or all time.',
  },
  {
    icon: Music2,
    title: 'Top tracks & previews',
    body: 'Your most-played songs, with 30s audio previews, popularity metrics, and instant radar breakdowns.',
  },
  {
    icon: History,
    title: 'Recently played',
    body: 'A scrollable timeline of your last 50 plays with duration metrics and quick-play previews.',
  },
  {
    icon: Radar,
    title: 'Audio DNA',
    body: 'Every track broken into energy, danceability, valence, acousticness, tempo, key, and loudness.',
  },
  {
    icon: Compass,
    title: 'Taste profile',
    body: 'Your genre spread, sonic archetype, and average audio fingerprint visualized into an explorable profile.',
  },
  {
    icon: Wand2,
    title: 'Playlist generator',
    body: 'Feed it any of your playlists, tune mood & energy, and save fresh AI recommendations straight to Spotify.',
  },
];

const steps = [
  {
    icon: Link2,
    title: 'Connect your account',
    body: 'Log in with Spotify. We only request read access to your listening history and permission to save generated playlists.',
  },
  {
    icon: Compass,
    title: 'Explore & preview data',
    body: 'Browse top artists, search tracks, listen to audio samples, and open any track to analyze its audio DNA.',
  },
  {
    icon: Sparkles,
    title: 'Build something new',
    body: 'Turn any playlist into seeds for tailored recommendations, then save the results directly to your library.',
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-base">
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-radial-fade" />

      {/* top nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-black">
            <Waves className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-cream">Sonalyze</span>
        </div>
        <LoginButton size="md" label="Log in with Spotify" />
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
        <div className="animate-rise">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-muted">
            <EqBars className="text-accent" />
            Built on your real listening history
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4rem]">
            See the shape
            <br />
            of your <span className="text-accent">sound.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Sonalyze reads your Spotify history and turns it into interactive visual insights —
            top artists and tracks, 30s audio previews, recently-played timelines, per-track audio
            DNA radars, and a smart playlist generator.
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <LoginButton />
            <p className="flex items-center gap-2 text-sm text-subtle">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
              Stateless & encrypted session. Nothing stored on our servers.
            </p>
          </div>
        </div>

        <div className="relative">
          <AlbumMosaic />
        </div>
      </section>

      {/* features grid */}
      <section className="relative z-10 border-t border-white/8 bg-panel/30 py-24 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-14 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Features</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your ears have been up to.
            </h2>
            <p className="mt-3 text-base text-muted">
              Deep analytics, interactive radar charts, sample player, and tools that make sense of your musical taste.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-white/8 bg-panel/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-panel"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-accent transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-cream">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-14 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Flow</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              From login to playlist in three steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className="relative rounded-2xl border border-white/8 bg-panel/40 p-7"
              >
                <span className="font-display text-3xl font-extrabold text-white/10">
                  0{i + 1}
                </span>
                <div className="mt-4 mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-cream">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold tracking-tight text-cream">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta banner */}
      <section className="relative z-10 pb-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/20 via-panel to-panel p-10 sm:p-14">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-cream">
                Ready to explore your listening DNA?
              </h2>
              <p className="mt-4 text-base text-muted">
                Connect with Spotify to see your top artists, audio attributes, and generate custom mixes in seconds.
              </p>
              <div className="mt-8">
                <LoginButton size="lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t border-white/8 py-10 text-center text-xs text-subtle">
        <p>Sonalyze — Spotify listening intelligence visualizer.</p>
        <p className="mt-1">Not affiliated with or endorsed by Spotify AB.</p>
      </footer>
    </main>
  );
}
