import type { StorageAdapter } from "./types";

/**
 * Browser adapter: persistence is handled by the Zustand `persist` middleware
 * (localStorage), so loading/saving here is intentionally a no-op.
 */
export const browserAdapter: StorageAdapter = {
  async loadUser() {
    return { user: null, preferences: null };
  },
  async saveUser() {},
  async savePreferences() {},
};
