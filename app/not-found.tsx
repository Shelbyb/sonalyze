import React from 'react';
import Link from 'next/link';
import { Disc3, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-4 sm:p-6 text-cream">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-surface/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent border border-accent/20">
          <Disc3 className="h-7 w-7 animate-spin [animation-duration:10s]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">404 Error</span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Page Not Found</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            The track, profile, or page you were looking for doesn&apos;t seem to exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent/90 text-black px-4 py-2.5 text-sm font-semibold transition-all shadow-lg shadow-accent/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-surface-elevated hover:bg-neutral-800 text-neutral-200 px-4 py-2.5 text-sm font-medium border border-neutral-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
