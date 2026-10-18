'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#090a0f] text-[#f2f4f8] antialiased">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-red-500/20 bg-[#12131a]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Application Error</h1>
              <p className="text-sm text-neutral-300 leading-relaxed">
                A critical error occurred while initializing the application.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => reset()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1ed760] hover:bg-[#1ed760]/90 text-black px-4 py-2.5 text-sm font-semibold transition-all shadow-lg shadow-[#1ed760]/20 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#191b24] hover:bg-[#20222e] text-neutral-200 px-4 py-2.5 text-sm font-medium border border-neutral-700 transition-colors"
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
