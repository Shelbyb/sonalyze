"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Database, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useCapabilities } from "@/hooks/useCapabilities";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateViews";

interface TopTrackItem {
  id: string;
  name: string;
  artists?: string[];
  popularity?: number;
}

interface TopArtistItem {
  id: string;
  name: string;
  genres?: string[];
  popularity?: number;
}

interface Snapshot {
  id: number;
  timeRange: string;
  capturedAt: string;
  topTracks: TopTrackItem[];
  topArtists: TopArtistItem[];
}

export default function HistoryPage() {
  const { history, loaded } = useCapabilities();
  const [snapshots, setSnapshots] = useState<Snapshot[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!history) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch("/api/user/history?timeRange=short_term")
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || `Could not load history (${r.status})`);
        }
        return r.json();
      })
      .then((d) => {
        setSnapshots(Array.isArray(d.snapshots) ? d.snapshots : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [history]);

  const latest = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return null;
    return snapshots[0];
  }, [snapshots]);

  const trendFor = (artistName: string) => {
    if (!snapshots || !artistName) return [];
    return snapshots
      .slice()
      .reverse()
      .map((s) => {
        const artists = Array.isArray(s.topArtists) ? s.topArtists : [];
        const idx = artists.findIndex((a) => a?.name === artistName);
        return idx !== -1 ? idx + 1 : 0;
      });
  };

  if (!loaded || (history && loading && !snapshots && !error)) {
    return <LoadingState label="Loading listening history snapshots" />;
  }

  if (!history) {
    return (
      <div
        className="mx-auto max-w-xl py-16 text-center"
        data-testid="history-hint"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Database className="h-7 w-7" />
        </div>
        <h1 className="font-display text-xl font-bold text-cream">
          Listening history needs a database
        </h1>
        <p className="mt-2 text-sm text-subtle leading-relaxed">
          Sonalyze is running in browser storage mode. Set{" "}
          <code className="rounded bg-elevated px-1.5 py-0.5 text-cream font-mono text-xs">DATABASE_URL</code> to a Postgres instance to record listening
          snapshots, track trends over time, and tag tracks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Timeline"
        title="Listening trends"
        description="Historical snapshots of your top music, tracking how your taste and favorite artists evolve over time."
      />

      {error && <ErrorState message="Could not load your history." hint={error} />}

      {snapshots && snapshots.length === 0 && !error && (
        <EmptyState
          title="No snapshots recorded yet"
          body="Your listening history snapshots are automatically recorded as you browse your dashboard overview."
        />
      )}

      {latest && Array.isArray(latest.topArtists) && latest.topArtists.length > 0 && (
        <section className="rounded-3xl border border-white/8 bg-panel/40 p-6 sm:p-8 backdrop-blur shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-cream">
              Top artist rank over time (recent 4 weeks)
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {latest.topArtists.slice(0, 10).map((a, idx) => {
              const ranks = trendFor(a?.name ?? '');
              return (
                <div
                  key={a?.id || a?.name || idx}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-subtle w-5">{idx + 1}.</span>
                    <span className="font-medium text-cream">{a?.name ?? "Unknown Artist"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-accent">
                    {ranks.length > 0
                      ? ranks.map((r, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded ${
                              r > 0 ? "bg-accent/10 text-accent font-semibold" : "bg-elevated text-subtle"
                            }`}
                          >
                            {r > 0 ? `#${r}` : "–"}
                          </span>
                        ))
                      : "–"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {snapshots && snapshots.length > 0 && (
        <section className="rounded-3xl border border-white/8 bg-panel/40 p-6 sm:p-8 backdrop-blur shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-cream">Snapshots History</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {snapshots.map((s) => {
              const tracksCount = Array.isArray(s.topTracks) ? s.topTracks.length : 0;
              const artistsCount = Array.isArray(s.topArtists) ? s.topArtists.length : 0;
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-white/8 bg-elevated/60 p-4 space-y-2 hover:border-accent/30 transition-colors"
                >
                  <p className="text-xs font-semibold text-cream">
                    {new Date(s.capturedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-subtle">
                    <span>{tracksCount} tracks</span>
                    <span>•</span>
                    <span>{artistsCount} artists</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
