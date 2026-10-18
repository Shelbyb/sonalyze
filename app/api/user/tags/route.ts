import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { trackTags } from '@/lib/db/schema';
import { ensureUser } from '@/lib/db/users';
import { requireUserDb } from '@/lib/storage/server';

export const dynamic = 'force-dynamic';

function clean(tag: unknown): string | null {
  if (typeof tag !== 'string') return null;
  const t = tag.trim().toLowerCase().slice(0, 32);
  return t.length > 0 ? t : null;
}

export async function GET(request: Request) {
  const ctx = await requireUserDb();
  if ('error' in ctx) return ctx.error;
  const trackId = new URL(request.url).searchParams.get('trackId');
  const where = trackId
    ? and(eq(trackTags.spotifyId, ctx.spotifyId), eq(trackTags.trackId, trackId))
    : eq(trackTags.spotifyId, ctx.spotifyId);
  const rows = await ctx.readDb.select().from(trackTags).where(where);
  return NextResponse.json({
    tags: rows.map((r) => ({ trackId: r.trackId, tag: r.tag })),
  });
}

export async function POST(request: Request) {
  const ctx = await requireUserDb();
  if ('error' in ctx) return ctx.error;
  const body = await request.json().catch(() => null);
  const tag = clean(body?.tag);
  if (!tag || typeof body?.trackId !== 'string' || !body.trackId) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  await ensureUser(ctx.db, ctx.spotifyId);
  await ctx.db
    .insert(trackTags)
    .values({ spotifyId: ctx.spotifyId, trackId: body.trackId, tag })
    .onConflictDoNothing();
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const ctx = await requireUserDb();
  if ('error' in ctx) return ctx.error;
  const body = await request.json().catch(() => null);
  const tag = clean(body?.tag);
  if (!tag || typeof body?.trackId !== 'string') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  await ctx.db
    .delete(trackTags)
    .where(
      and(
        eq(trackTags.spotifyId, ctx.spotifyId),
        eq(trackTags.trackId, body.trackId),
        eq(trackTags.tag, tag),
      ),
    );
  return NextResponse.json({ ok: true });
}
