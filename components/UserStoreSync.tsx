'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/lib/stores/useUserStore';

export default function UserStoreSync() {
  const { data: session, status } = useSession();
  const syncFromSession = useUserStore((s) => s.syncFromSession);
  const fetchAndSyncProfile = useUserStore((s) => s.fetchAndSyncProfile);
  const clearUser = useUserStore((s) => s.clearUser);
  const lastSyncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      syncFromSession(session);

      const token = (session as any)?.accessToken as string | undefined;
      if (token && token !== lastSyncedTokenRef.current) {
        lastSyncedTokenRef.current = token;
        fetchAndSyncProfile(token);
      }
    } else if (status === 'unauthenticated') {
      lastSyncedTokenRef.current = null;
      // When explicitly unauthenticated, clear user profile from store
      clearUser();
    }
  }, [session, status, syncFromSession, fetchAndSyncProfile, clearUser]);

  return null;
}
