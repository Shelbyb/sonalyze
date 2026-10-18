import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { users } from '@/lib/db/schema';
import { requireUserDb } from '@/lib/storage/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await requireUserDb();
  if ('error' in ctx) return ctx.error;
  const rows = await ctx.db
    .select()
    .from(users)
    .where(eq(users.spotifyId, ctx.spotifyId))
    .limit(1);
  const row = rows[0];
  return NextResponse.json({
    user: row
      ? {
          id: row.spotifyId,
          name: row.name,
          email: row.email,
          image: row.image,
          product: row.product,
          country: row.country,
        }
      : null,
    preferences: row?.preferences ?? null,
  });
}

export async function PUT(request: Request) {
  const ctx = await requireUserDb();
  if ('error' in ctx) return ctx.error;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const { user, preferences } = body as {
    user?: Record<string, any>;
    preferences?: Record<string, any>;
  };
  const values = {
    spotifyId: ctx.spotifyId,
    ...(user
      ? {
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          product: user.product ?? null,
          country: user.country ?? null,
        }
      : {}),
    ...(preferences ? { preferences } : {}),
    updatedAt: new Date(),
  };
  const { spotifyId: _id, ...updates } = values;
  await ctx.db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({ target: users.spotifyId, set: updates });
  return NextResponse.json({ ok: true });
}
