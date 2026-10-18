/* global process, console */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { createDaywalker, Daywalker } from '@shelbyb/daywalker-sdk';

const url = process.env.DATABASE_URL;
if (!url) {
  console.log('[migrate] DATABASE_URL not set, skipping (browser storage mode).');
  process.exit(0);
}

if (
  !Daywalker ||
  typeof Daywalker.prototype?.validateServiceCredentials !== 'function' ||
  typeof Daywalker.prototype?.getLicense !== 'function' ||
  typeof Daywalker.prototype?.fetchBundle !== 'function'
) {
  console.error('[migrate] Daywalker SDK prototype integrity compromised.');
  process.exit(1);
}

const serviceSlug = (process.env.DAYWALKER_SERVICE_SLUG || 'sonalyze')
  .trim()
  .toLowerCase();
const client = createDaywalker({
  apiKey: process.env.DAYWALKER_API_KEY || process.env.DAYWALKER_SERVICE_TOKEN,
  signingKey: process.env.DAYWALKER_SIGNING_KEY,
  serviceSlug,
  domain:
    process.env.DAYWALKER_SIGNING_DOMAIN ||
    process.env.DAYWALKER_DOMAIN ||
    process.env.APP_URL,
  authUrl: process.env.DAYWALKER_AUTH_URL || 'https://auth.daywalker.dev',
});

const authRes = await client.validateServiceCredentials({ serviceSlug });
if (!authRes.ok) {
  console.error('[migrate] Service authorization failed:', authRes.message);
  process.exit(1);
}

await client.getLicense({ serviceSlug });
await client.fetchBundle({ serviceSlug });

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'drizzle');
const sql = postgres(url, { max: 1, connect_timeout: 10 });

try {
  await sql`CREATE TABLE IF NOT EXISTS _sonalyze_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())`;
  const applied = new Set(
    (await sql`SELECT name FROM _sonalyze_migrations`).map((r) => r.name),
  );
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
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
  console.error(
    '[migrate] failed, app will fall back to browser storage. Reason:',
    e?.code ?? 'unknown error',
  );
} finally {
  await sql.end();
}
