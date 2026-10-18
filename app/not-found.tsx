import React from 'react';
import Link from 'next/link';
import { Disc3, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-base text-cream flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="bg-surface/90 relative w-full max-w-lg space-y-6 rounded-2xl border border-neutral-800 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="bg-accent/10 text-accent border-accent/20 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
          <Disc3 className="h-7 w-7 animate-spin [animation-duration:10s]" />
        </div>

        <div className="space-y-2">
          <span className="text-accent text-xs font-semibold tracking-widest uppercase">
            404 Error
          </span>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Page Not Found
          </h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            The track, profile, or page you were looking for doesn&apos;t seem to exist or
            may have been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href="/dashboard"
            className="bg-accent hover:bg-accent/90 shadow-accent/20 inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black shadow-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="bg-surface-elevated inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
