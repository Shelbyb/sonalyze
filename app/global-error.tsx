'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#090a0f] text-[#f2f4f8] antialiased">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-lg space-y-6 rounded-2xl border border-red-500/20 bg-[#12131a]/90 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Application Error</h1>
              <p className="text-sm leading-relaxed text-neutral-300">
                A critical error occurred while initializing the application.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={() => reset()}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1ed760] px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-[#1ed760]/20 transition-all hover:bg-[#1ed760]/90"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#191b24] px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-[#20222e]"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
