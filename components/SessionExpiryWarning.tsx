'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Clock, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';

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
        await fetch('/api/auth/session');
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

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-surface/95 p-6 sm:p-8 shadow-2xl shadow-amber-950/40 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-4 animate-pulse">
          <Clock className="h-7 w-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
          <AlertTriangle className="h-3.5 w-3.5" />
          Session Warning
        </div>

        <h2
          id="session-warning-title"
          className="text-xl sm:text-2xl font-bold font-display text-white mb-2"
        >
          Session Expiring Soon
        </h2>

        <p
          id="session-warning-desc"
          className="text-sm text-neutral-300 leading-relaxed mb-6"
        >
          Your session will expire in{' '}
          <span className="font-mono font-bold text-accent text-base px-1.5 py-0.5 rounded bg-surface-elevated border border-neutral-700">
            {formattedTime}
          </span>
          . Would you like to refresh your session to continue listening and exploring, or log out?
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogout}
            disabled={isRefreshing}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-surface-elevated hover:bg-neutral-800 text-neutral-300 hover:text-white px-4 py-2.5 text-sm font-medium border border-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent/90 text-black px-4 py-2.5 text-sm font-semibold transition-all shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Extend Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
