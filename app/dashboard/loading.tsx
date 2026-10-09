import React from 'react';
import { TrackListSkeleton, StatCardSkeleton } from '@/components/Skeleton';
import EqBars from '@/components/EqBars';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-white/5" />
        <div className="h-8 w-64 rounded bg-white/10" />
        <div className="h-4 w-96 rounded bg-white/5" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <TrackListSkeleton count={6} />
    </div>
  );
}
