import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __sonalyzeDb?: Db;
  __sonalyzeReadDb?: Db;
};

function connect(url: string): Db {
  const client = postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 5,
  });
  return drizzle(client, { schema });
}

/** Primary (read/write) connection. */
export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalForDb.__sonalyzeDb) globalForDb.__sonalyzeDb = connect(url);
  return globalForDb.__sonalyzeDb;
}

/**
 * Read-only replica connection (DATABASE_READ_URL). Falls back to the primary
 * when no replica is configured. Use only for reads that tolerate replica lag.
 */
export function getReadDb(): Db | null {
  const url = process.env.DATABASE_READ_URL;
  if (!url) return getDb();
  if (!globalForDb.__sonalyzeReadDb)
    globalForDb.__sonalyzeReadDb = connect(url);
  return globalForDb.__sonalyzeReadDb;
}

export async function isDbReachable(): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await db.execute("select 1" as any);
    return true;
  } catch {
    return false;
  }
}
