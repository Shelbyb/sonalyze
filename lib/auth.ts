import type { NextAuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { validateServiceToken, requireServiceAuth } from '@/lib/daywalker-auth';

// Scopes needed across the app: reading top items, recently played,
// playlists, and creating/modifying playlists for the recommendation feature.
const SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
].join(' ');

async function refreshAccessToken(token: any) {
  try {
    await requireServiceAuth();
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (err) {
    console.error('Error refreshing access token', err);
    return { ...token, error: 'RefreshAccessTokenError' as const };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(
        SCOPES
      )}`,
    }),
  ],
  // No database: sessions are JSON Web Tokens stored entirely in an
  // encrypted browser cookie. Nothing is persisted server-side.
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async signIn() {
      const authResult = await validateServiceToken();
      return authResult.valid;
    },
    async jwt({ token, account, profile }) {
      await requireServiceAuth();
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          spotifyId: (profile as any).id,
        };
      }
      if (Date.now() < (token as any).accessTokenExpires - 60_000) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      const authResult = await validateServiceToken();
      if (!authResult.valid) {
        return null as any;
      }
      (session as any).accessToken = (token as any).accessToken;
      (session as any).error = (token as any).error;
      (session as any).spotifyId = (token as any).spotifyId;
      return session;
    },
  },
};
