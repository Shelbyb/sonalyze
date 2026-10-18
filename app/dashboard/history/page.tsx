"use client";

import React, { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { useCapabilities } from "@/hooks/useCapabilities";

interface Snapshot {
  id: number;
  timeRange: string;
  capturedAt: string;
  topTracks: { id: string; name: string; artists?: string[] }[];
  topArtists: { id: string; name: string; genres?: string[] }[];
}

export default function HistoryPage() {
  const { history, loaded } = useCapabilities();
  const [snapshots, setSnapshots] = useState<Snapshot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!history) return;
    fetch("/api/user/history?timeRange=short_term")
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Could not load history")),
      )
      .then((d) => setSnapshots(d.snapshots ?? []))
      .catch((e) => setError(e.message));
  }, [history]);

  if (!loaded) return null;

  if (!history) {
    return (
      <div
        className="mx-auto max-w-xl py-16 text-center"
        data-testid="history-hint"
      >
        <Database className="mx-auto mb-4 h-8 w-8 text-accent" />
        <h1 className="font-display text-xl font-bold text-cream">
          Listening history needs a database
        </h1>
        <p className="mt-2 text-sm text-subtle">
          Sonalyze is running in browser storage mode. Set{" "}
          <code>DATABASE_URL</code> to a Postgres instance to record listening
          snapshots, track trends over time and tag tracks.
        </p>
      </div>
    );
  }

  const trendFor = (artistName: string) =>
    (snapshots ?? [])
      .slice()
      .reverse()
      .map((s) => s.topArtists.findIndex((a) => a.name === artistName) + 1);

  const latest = snapshots?.[0];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-cream">
        Listening trends
      </h1>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {snapshots && snapshots.length === 0 && (
        <p className="text-sm text-subtle">
          No snapshots yet. Visit the overview to record your first one.
        </p>
      )}
      {latest && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-cream">
            Top artist rank over time (recent 4 weeks)
          </h2>
          <ul className="space-y-1 text-sm text-subtle">
            {latest.topArtists.map((a) => (
              <li key={a.id}>
                <span className="text-cream">{a.name}</span>:{" "}
                {trendFor(a.name)
                  .map((r) => (r ? `#${r}` : "–"))
                  .join(" → ")}
              </li>
            ))}
          </ul>
        </section>
      )}
      {snapshots && snapshots.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-cream">Snapshots</h2>
          <ul className="space-y-1 text-xs text-subtle">
            {snapshots.map((s) => (
              <li key={s.id}>
                {new Date(s.capturedAt).toLocaleString()} · {s.topTracks.length}{" "}
                tracks · {s.topArtists.length} artists
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
