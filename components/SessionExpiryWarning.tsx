'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatClock } from '@/lib/format';
import { Clock, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
import { fetchWithRetry } from '@/lib/fetch-retry';

const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function SessionExpiryWarning() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine expiration timestamp from session
  const getExpiresAt = useCallback(() => {
    if (!session) return null;
    const tokenExpires = session.accessTokenExpires;
    const sessionExpires = session.expires ? new Date(session.expires).getTime() : null;

    if (tokenExpires && sessionExpires) {
      return Math.min(tokenExpires, sessionExpires);
    }
    return tokenExpires || sessionExpires || null;
  }, [session]);

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: '/' });
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (typeof update === 'function') {
        const updated = await update();
        if ((updated as any)?.error === 'RefreshAccessTokenError') {
          await handleLogout();
          return;
        }
      } else {
        await fetchWithRetry('/api/auth/session');
        router.refresh();
      }
      setShowWarning(false);
      setTimeLeftSec(null);
    } catch {
      await handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (status !== 'authenticated' || !session) {
      setShowWarning(false);
      setTimeLeftSec(null);
      return;
    }

    // If session has an error, redirect to main page to login
    if (session.error) {
      signOut({ callbackUrl: '/?error=SessionExpired' });
      return;
    }

    const checkExpiration = () => {
      const expiresAt = getExpiresAt();
      if (!expiresAt) return;

      const diff = expiresAt - Date.now();
      const secondsLeft = Math.max(0, Math.floor(diff / 1000));

      if (diff <= 0) {
        // Session expired - redirect to login
        signOut({ callbackUrl: '/?error=SessionExpired' });
        return;
      }

      if (diff <= WARNING_THRESHOLD_MS) {
        setTimeLeftSec(secondsLeft);
        setShowWarning(true);
      } else {
        setShowWarning(false);
        setTimeLeftSec(null);
      }
    };

    // Check immediately
    checkExpiration();

    // Check periodically
    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [session, status, getExpiresAt]);

  if (!showWarning || timeLeftSec === null) {
    return null;
  }

  const formattedTime = formatClock(timeLeftSec);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-all"
    >
      <div className="bg-surface/95 relative w-full max-w-md rounded-2xl border border-amber-500/30 p-6 text-center shadow-2xl shadow-amber-950/40 backdrop-blur-xl sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-400">
          <Clock className="h-7 w-7" />
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-amber-400 uppercase">
          <AlertTriangle className="h-3.5 w-3.5" />
          Session Warning
        </div>

        <h2
          id="session-warning-title"
          className="font-display mb-2 text-xl font-bold text-white sm:text-2xl"
        >
          Session Expiring Soon
        </h2>

        <p
          id="session-warning-desc"
          className="mb-6 text-sm leading-relaxed text-neutral-300"
        >
          Your session will expire in{' '}
          <span className="text-accent bg-surface-elevated rounded border border-neutral-700 px-1.5 py-0.5 font-mono text-base font-bold">
            {formattedTime}
          </span>
          . Would you like to refresh your session to continue listening and exploring, or
          log out?
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleLogout}
            disabled={isRefreshing}
            className="bg-surface-elevated inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-accent hover:bg-accent/90 shadow-accent/20 inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Extend Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
