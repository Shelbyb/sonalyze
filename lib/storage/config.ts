export type StorageMode = 'browser' | 'postgres';

export interface Capabilities {
  mode: StorageMode;
  history: boolean;
  tags: boolean;
  syncedPrefs: boolean;
}

export function getStorageMode(env: NodeJS.ProcessEnv = process.env): StorageMode {
  const requested = env.STORAGE_MODE?.toLowerCase();
  if (requested === 'browser') return 'browser';
  if (env.DATABASE_URL) return 'postgres';
  return 'browser';
}

export function getCapabilities(env: NodeJS.ProcessEnv = process.env): Capabilities {
  const postgres = getStorageMode(env) === 'postgres';
  return {
    mode: postgres ? 'postgres' : 'browser',
    history: postgres,
    tags: postgres,
    syncedPrefs: postgres,
  };
}

export const BROWSER_CAPABILITIES: Capabilities = {
  mode: 'browser',
  history: false,
  tags: false,
  syncedPrefs: false,
};
