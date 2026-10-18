/* global process, console */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.log('[migrate] DATABASE_URL not set, skipping (browser storage mode).');
  process.exit(0);
}

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'drizzle');
const sql = postgres(url, { max: 1, connect_timeout: 10 });

try {
  await sql`CREATE TABLE IF NOT EXISTS _sonalyze_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())`;
  const applied = new Set((await sql`SELECT name FROM _sonalyze_migrations`).map((r) => r.name));
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(join(dir, file), 'utf8'));
      await tx`INSERT INTO _sonalyze_migrations (name) VALUES (${file})`;
    });
    console.log(`[migrate] applied ${file}`);
  }
  console.log('[migrate] up to date.');
} catch (e) {
  console.error('[migrate] failed, app will fall back to browser storage. Reason:', e?.code ?? 'unknown error');
} finally {
  await sql.end();
}
