import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TimeRange, SpotifyUser } from '@/types/spotify';
import { getMe } from '@/lib/spotify';

export interface UserProfile {
  id: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  product?: string | null;
  country?: string | null;
  followersCount?: number | null;
  spotifyUri?: string | null;
}

export interface UserPreferences {
  defaultTimeRange: TimeRange;
  audioAutoplay: boolean;
  volume: number;
}

export interface UserStoreState {
  user: UserProfile | null;
  preferences: UserPreferences;
  lastSyncedAt: number | null;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUser: (user: Partial<UserProfile> | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setDefaultTimeRange: (range: TimeRange) => void;
  setVolume: (volume: number) => void;
  setAudioAutoplay: (autoplay: boolean) => void;
  clearUser: () => void;
  reset: () => void;
  syncFromSession: (session: any) => void;
  syncFromSpotify: (spotifyUser: SpotifyUser) => void;
  fetchAndSyncProfile: (token: string) => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultTimeRange: 'medium_term',
  audioAutoplay: false,
  volume: 0.8,
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      preferences: DEFAULT_PREFERENCES,
      lastSyncedAt: null,
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      setUser: (user) => {
        if (!user) {
          set({ user: null, lastSyncedAt: null });
          return;
        }
        set((state) => ({
          user: {
            id: user.id ?? state.user?.id ?? null,
            name: user.name ?? state.user?.name ?? null,
            email: user.email ?? state.user?.email ?? null,
            image: user.image ?? state.user?.image ?? null,
            product: user.product ?? state.user?.product ?? null,
            country: user.country ?? state.user?.country ?? null,
            followersCount: user.followersCount ?? state.user?.followersCount ?? null,
            spotifyUri: user.spotifyUri ?? state.user?.spotifyUri ?? null,
          },
          lastSyncedAt: Date.now(),
        }));
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, ...updates }
            : {
                id: updates.id ?? null,
                name: updates.name ?? null,
                email: updates.email ?? null,
                image: updates.image ?? null,
                product: updates.product ?? null,
                country: updates.country ?? null,
                followersCount: updates.followersCount ?? null,
                spotifyUri: updates.spotifyUri ?? null,
              },
          lastSyncedAt: Date.now(),
        }));
      },

      setPreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }));
      },

      setDefaultTimeRange: (defaultTimeRange) => {
        set((state) => ({
          preferences: { ...state.preferences, defaultTimeRange },
        }));
      },

      setVolume: (volume) => {
        set((state) => ({
          preferences: { ...state.preferences, volume: Math.max(0, Math.min(1, volume)) },
        }));
      },

      setAudioAutoplay: (audioAutoplay) => {
        set((state) => ({
          preferences: { ...state.preferences, audioAutoplay },
        }));
      },

      clearUser: () => {
        set({ user: null, lastSyncedAt: null });
      },

      reset: () => {
        set({
          user: null,
          preferences: DEFAULT_PREFERENCES,
          lastSyncedAt: null,
        });
      },

      syncFromSession: (session) => {
        if (!session?.user) return;
        const current = get().user;
        const newUser: UserProfile = {
          id: (session as any).spotifyId || session.user.id || current?.id || null,
          name: session.user.name ?? current?.name ?? null,
          email: session.user.email ?? current?.email ?? null,
          image: session.user.image ?? current?.image ?? null,
          product: current?.product ?? null,
          country: current?.country ?? null,
          followersCount: current?.followersCount ?? null,
          spotifyUri: current?.spotifyUri ?? null,
        };
        set({ user: newUser, lastSyncedAt: Date.now() });
      },

      syncFromSpotify: (spotifyUser) => {
        const current = get().user;
        const newUser: UserProfile = {
          id: spotifyUser.id ?? current?.id ?? null,
          name: spotifyUser.display_name ?? current?.name ?? null,
          email: current?.email ?? null,
          image: spotifyUser.images?.[0]?.url ?? current?.image ?? null,
          product: spotifyUser.product ?? current?.product ?? null,
          country: spotifyUser.country ?? current?.country ?? null,
          followersCount: spotifyUser.followers?.total ?? current?.followersCount ?? null,
          spotifyUri: spotifyUser.external_urls?.spotify ?? current?.spotifyUri ?? null,
        };
        set({ user: newUser, lastSyncedAt: Date.now() });
      },

      fetchAndSyncProfile: async (token: string) => {
        if (!token) return;
        try {
          const profile = await getMe(token);
          if (profile) {
            get().syncFromSpotify(profile);
          }
        } catch (e) {
          // If profile fetch fails (e.g. rate limit), keep existing persisted user state
          console.warn('Could not fetch Spotify profile for user store:', e);
        }
      },
    }),
    {
      name: 'sonalyze_user_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : ({} as Storage))),
      partialize: (state) => ({
        user: state.user,
        preferences: state.preferences,
        lastSyncedAt: state.lastSyncedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
