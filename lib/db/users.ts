import { users } from './schema';
import type { getDb } from './client';

export async function ensureUser(
  db: NonNullable<ReturnType<typeof getDb>>,
  spotifyId: string,
) {
  await db.insert(users).values({ spotifyId }).onConflictDoNothing();
}
