"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore, setStorageAdapter } from "@/lib/stores/useUserStore";
import { browserAdapter } from "@/lib/storage/adapters/browser";
import { useCapabilities } from "@/hooks/useCapabilities";

export default function UserStoreSync() {
  const { data: session, status } = useSession();
  const syncFromSession = useUserStore((s) => s.syncFromSession);
  const fetchAndSyncProfile = useUserStore((s) => s.fetchAndSyncProfile);
  const clearUser = useUserStore((s) => s.clearUser);
  const hydrateFromAdapter = useUserStore((s) => s.hydrateFromAdapter);
  const { mode, loaded } = useCapabilities();
  const lastSyncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!loaded || status !== "authenticated") return;
    if (mode === "postgres") {
      import("@/lib/storage/adapters/api").then(({ apiAdapter }) => {
        setStorageAdapter(apiAdapter);
        hydrateFromAdapter();
      });
    } else {
      setStorageAdapter(browserAdapter);
    }
  }, [loaded, mode, status, hydrateFromAdapter]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      syncFromSession(session);

      const token = (session as any)?.accessToken as string | undefined;
      if (token && token !== lastSyncedTokenRef.current) {
        lastSyncedTokenRef.current = token;
        fetchAndSyncProfile(token);
      }
    } else if (status === "unauthenticated") {
      lastSyncedTokenRef.current = null;
      // When explicitly unauthenticated, clear user profile from store
      clearUser();
    }
  }, [session, status, syncFromSession, fetchAndSyncProfile, clearUser]);

  return null;
}
