'use client';

import { useSession } from 'next-auth/react';

export interface UseSpotifyTokenResult {
  token: string | undefined;
  session: ReturnType<typeof useSession>['data'];
  status: ReturnType<typeof useSession>['status'];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | undefined;
}

/**
 * Custom React hook to extract the Spotify access token and authentication state
 * with full TypeScript safety.
 */
export function useSpotifyToken(): UseSpotifyTokenResult {
  const { data: session, status } = useSession();

  const token = session?.accessToken;
  const error = session?.error;
  const isAuthenticated = status === 'authenticated' && Boolean(token) && !error;
  const isLoading = status === 'loading';

  return {
    token,
    session,
    status,
    isAuthenticated,
    isLoading,
    error,
  };
}
