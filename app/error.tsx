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
    <div className="min-h-screen flex items-center justify-center bg-base p-4 sm:p-6 text-cream">
      <div className="relative w-full max-w-lg rounded-2xl border border-red-500/20 bg-surface/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-display text-white">
            {isSessionError ? 'Session Expired or Invalid' : 'Something went wrong'}
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {isSessionError
              ? redirectCountdown !== null && redirectCountdown > 0
                ? `Your session is invalid or has expired. Redirecting to the login page in ${redirectCountdown}s...`
                : 'Your session is invalid or has expired. Please sign in again to continue.'
              : 'An unexpected error occurred while loading this page. You can try refreshing or returning to the home page.'}
          </p>
        </div>

        {errorMessage && !isSessionError && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-left">
            <p className="text-xs text-neutral-400 font-mono break-all">{errorMessage}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isSessionError ? (
            <button
              onClick={handleLoginRedirect}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent/90 text-black px-5 py-3 text-sm font-semibold transition-all shadow-lg shadow-accent/20 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              Return to Login
            </button>
          ) : (
            <>
              <button
                onClick={() => reset()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent/90 text-black px-4 py-2.5 text-sm font-semibold transition-all shadow-lg shadow-accent/20 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-surface-elevated hover:bg-neutral-800 text-neutral-200 px-4 py-2.5 text-sm font-medium border border-neutral-700 transition-colors"
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
