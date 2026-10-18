'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ShieldAlert, AlertTriangle, LogIn, ArrowRight } from 'lucide-react';

const ERROR_MESSAGES: Record<
  string,
  { title: string; description: string; isSession: boolean }
> = {
  SessionRequired: {
    title: 'Authentication Required',
    description: 'You need to be signed in with Spotify to access this page.',
    isSession: true,
  },
  SessionExpired: {
    title: 'Session Expired',
    description: 'Your Spotify session has expired. Please sign in again to continue.',
    isSession: true,
  },
  RefreshAccessTokenError: {
    title: 'Session Refresh Failed',
    description: 'We could not refresh your Spotify access token. Please sign in again.',
    isSession: true,
  },
  OAuthSignin: {
    title: 'Sign-in Failed',
    description: 'Error constructing the Spotify authorization URL. Please try again.',
    isSession: true,
  },
  OAuthCallback: {
    title: 'Authentication Callback Error',
    description: 'There was a problem verifying your Spotify account response.',
    isSession: true,
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create or link your Spotify account.',
    isSession: true,
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You declined Spotify authorization or do not have access permissions.',
    isSession: true,
  },
  Verification: {
    title: 'Verification Error',
    description: 'The verification token has expired or has already been used.',
    isSession: true,
  },
  Configuration: {
    title: 'Server Configuration Error',
    description:
      'There is a server authentication configuration issue. Please contact support.',
    isSession: false,
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected authentication or session error occurred.',
    isSession: true,
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  const errorParam = searchParams.get('error') || 'Default';
  const errorInfo = ERROR_MESSAGES[errorParam] || {
    title: 'Session Error',
    description: 'A problem occurred with your user session.',
    isSession: true,
  };

  useEffect(() => {
    // If it's a session problem, auto-redirect to main page to login by default
    if (errorInfo.isSession) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
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
  }, [errorInfo.isSession, router]);

  const handleLogin = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch {
      router.push('/');
    }
  };

  return (
    <div className="bg-base text-cream relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Background ambient glow */}
      <div className="bg-accent/10 pointer-events-none absolute top-1/4 left-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

      <div className="bg-surface/90 relative w-full max-w-lg space-y-6 rounded-2xl border border-neutral-800 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          {errorInfo.isSession ? (
            <ShieldAlert className="h-7 w-7" />
          ) : (
            <AlertTriangle className="h-7 w-7" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-white">
            {errorInfo.title}
          </h1>
          <p className="text-sm leading-relaxed text-neutral-300">
            {errorInfo.description}
          </p>
        </div>

        {errorInfo.isSession && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-300">
            {countdown > 0
              ? `Redirecting you to the main login page in ${countdown}s...`
              : 'Redirecting to login...'}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            onClick={handleLogin}
            className="bg-accent hover:bg-accent/90 shadow-accent/20 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black shadow-lg transition-all"
          >
            <LogIn className="h-4 w-4" />
            Go to Login
          </button>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-white"
          >
            Return to Sonalyze Home
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-base flex min-h-screen items-center justify-center text-neutral-400">
          <div className="text-sm">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
