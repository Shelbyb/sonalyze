import React from 'react';

export function TrackRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-xl px-3 py-2.5">
      <div className="h-4 w-5 rounded bg-white/5" />
      <div className="h-12 w-12 shrink-0 rounded-md bg-white/10" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/5 rounded bg-white/10" />
        <div className="h-3 w-1/4 rounded bg-white/5" />
      </div>
      <div className="hidden h-3 w-10 rounded bg-white/5 sm:block" />
    </div>
  );
}

export function TrackListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-panel/40 p-2 space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <TrackRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-white/8 bg-panel/50 p-4">
      <div className="relative mb-4 aspect-square w-full rounded-full bg-white/10" />
      <div className="mx-auto h-4 w-3/4 rounded bg-white/10" />
      <div className="mx-auto mt-2 h-3 w-1/2 rounded bg-white/5" />
    </div>
  );
}

export function ArtistGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ArtistCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col justify-between rounded-2xl border border-white/8 bg-panel/50 p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-white/5" />
        <div className="h-8 w-8 rounded-lg bg-white/10" />
      </div>
      <div className="mt-4 space-y-1">
        <div className="h-7 w-32 rounded bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/5" />
      </div>
    </div>
  );
}
