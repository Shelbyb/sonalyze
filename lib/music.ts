import type { AudioFeatures } from '@/types/spotify';

export const PITCH_CLASS_KEYS: readonly string[] = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
] as const;

/**
 * Camelot wheel mapping for harmonic mixing notation (e.g. "8B" for C Major, "5A" for C Minor).
 */
export const CAMELOT_KEYS: Record<string, string> = {
  'C maj': '8B',
  'C min': '5A',
  'C♯ maj': '3B',
  'C♯ min': '12A',
  'D maj': '10B',
  'D min': '7A',
  'D♯ maj': '5B',
  'D♯ min': '2A',
  'E maj': '12B',
  'E min': '9A',
  'F maj': '7B',
  'F min': '4A',
  'F♯ maj': '2B',
  'F♯ min': '11A',
  'G maj': '9B',
  'G min': '6A',
  'G♯ maj': '4B',
  'G♯ min': '1A',
  'A maj': '11B',
  'A min': '8A',
  'A♯ maj': '6B',
  'A♯ min': '3A',
  'B maj': '1B',
  'B min': '10A',
};

export interface AudioStatDefinition {
  key: keyof AudioFeatures;
  label: string;
  hint: string;
}

export const AUDIO_STAT_DEFINITIONS: readonly AudioStatDefinition[] = [
  {
    key: 'danceability',
    label: 'Danceability',
    hint: 'Rhythmic suitability for dancing based on tempo and beat strength',
  },
  {
    key: 'energy',
    label: 'Energy',
    hint: 'Perceived intensity, activity, speed, and loudness',
  },
  {
    key: 'valence',
    label: 'Valence (Positivity)',
    hint: 'Musical cheerfulness and euphoria vs gloominess',
  },
  {
    key: 'acousticness',
    label: 'Acousticness',
    hint: 'Confidence level whether the track is purely acoustic',
  },
  {
    key: 'instrumentalness',
    label: 'Instrumentalness',
    hint: 'Likelihood that the track contains no vocal content',
  },
  {
    key: 'liveness',
    label: 'Liveness',
    hint: 'Audience presence detection in the recording',
  },
  {
    key: 'speechiness',
    label: 'Speechiness',
    hint: 'Presence of spoken words like rap or podcast',
  },
] as const;

/**
 * Formats key number and mode into standard musical notation (e.g. "C min", "F♯ maj").
 */
export function formatMusicalKey(key: number = 0, mode: number = 1): string {
  const pitch = PITCH_CLASS_KEYS[key] ?? '—';
  const modality = mode === 1 ? 'maj' : 'min';
  return `${pitch} ${modality}`;
}

/**
 * Resolves Camelot wheel notation for a given key and mode.
 */
export function getCamelotKey(key: number = 0, mode: number = 1): string | null {
  const keyText = formatMusicalKey(key, mode);
  return CAMELOT_KEYS[keyText] ?? null;
}
