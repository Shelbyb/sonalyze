/** Formats a whole number of seconds as `m:ss`. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Formats a duration in milliseconds as `m:ss` (rounded to the nearest second). */
export function formatDuration(ms: number): string {
  return formatClock(Math.round(ms / 1000));
}

/** Converts a duration in milliseconds to whole minutes. */
export function msToMinutes(ms: number): number {
  return ms / 60000;
}
