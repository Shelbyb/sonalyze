'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AlertTriangle, RotateCcw, Home, LogIn } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number; statusCode?: number };
  reset: () => void;
}) {
  const router = useRouter();
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const errorMessage = error?.message || '';
  const isSessionError =
    /session|unauthorized|jwt|token|401|auth|spotify.*auth|expired/i.test(errorMessage) ||
    error?.status === 401 ||
    error?.statusCode === 401;

  useEffect(() => {
    console.error('Application Error:', error);

    // If there is a session problem, automatically redirect to the main page to login
    if (isSessionError) {
      setRedirectCountdown(3);
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            signOut({ callbackUrl: '/' }).catch(() => {
              router.push('/');
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [error, isSessionError, router]);

  const handleLoginRedirect = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch {
      router.push('/');
    }
  };

  return (
    <div className="bg-base text-cream flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="bg-surface/90 relative w-full max-w-lg space-y-6 rounded-2xl border border-red-500/20 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-white">
            {isSessionError ? 'Session Expired or Invalid' : 'Something went wrong'}
          </h1>
          <p className="text-sm leading-relaxed text-neutral-300">
            {isSessionError
              ? redirectCountdown !== null && redirectCountdown > 0
                ? `Your session is invalid or has expired. Redirecting to the login page in ${redirectCountdown}s...`
                : 'Your session is invalid or has expired. Please sign in again to continue.'
              : 'An unexpected error occurred while loading this page. You can try refreshing or returning to the home page.'}
          </p>
        </div>

        {errorMessage && !isSessionError && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-left">
            <p className="font-mono text-xs break-all text-neutral-400">{errorMessage}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          {isSessionError ? (
            <button
              onClick={handleLoginRedirect}
              className="bg-accent hover:bg-accent/90 shadow-accent/20 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black shadow-lg transition-all"
            >
              <LogIn className="h-4 w-4" />
              Return to Login
            </button>
          ) : (
            <>
              <button
                onClick={() => reset()}
                className="bg-accent hover:bg-accent/90 shadow-accent/20 inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black shadow-lg transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <Link
                href="/"
                className="bg-surface-elevated inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
