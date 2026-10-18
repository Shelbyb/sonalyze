import type { UserProfile, UserPreferences } from "@/lib/stores/useUserStore";

export interface StorageAdapter {
  loadUser(): Promise<{
    user: UserProfile | null;
    preferences: UserPreferences | null;
  }>;
  saveUser(user: UserProfile | null): Promise<void>;
  savePreferences(preferences: UserPreferences): Promise<void>;
}
