import type { StorageAdapter } from "./types";

async function request(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Storage API ${path} failed: ${res.status}`);
  return res.json();
}

export const apiAdapter: StorageAdapter = {
  async loadUser() {
    const data = await request("/api/user/preferences");
    return { user: data.user ?? null, preferences: data.preferences ?? null };
  },
  async saveUser(user) {
    if (!user) return;
    await request("/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ user }),
    });
  },
  async savePreferences(preferences) {
    await request("/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ preferences }),
    });
  },
};
