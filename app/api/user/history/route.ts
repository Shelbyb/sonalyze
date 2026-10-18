import { NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { listeningSnapshots } from "@/lib/db/schema";
import { ensureUser } from "@/lib/db/users";
import { requireUserDb } from "@/lib/storage/server";

export const dynamic = "force-dynamic";

export const SNAPSHOT_THROTTLE_MS = 6 * 60 * 60 * 1000;
const RANGES = ["short_term", "medium_term", "long_term"];

export async function GET(request: Request) {
  const ctx = await requireUserDb();
  if ("error" in ctx) return ctx.error;
  const range = new URL(request.url).searchParams.get("timeRange");
  const where =
    range && RANGES.includes(range)
      ? and(
          eq(listeningSnapshots.spotifyId, ctx.spotifyId),
          eq(listeningSnapshots.timeRange, range),
        )
      : eq(listeningSnapshots.spotifyId, ctx.spotifyId);
  const snapshots = await ctx.readDb
    .select()
    .from(listeningSnapshots)
    .where(where)
    .orderBy(desc(listeningSnapshots.capturedAt))
    .limit(100);
  return NextResponse.json({ snapshots });
}

export async function POST(request: Request) {
  const ctx = await requireUserDb();
  if ("error" in ctx) return ctx.error;
  const body = await request.json().catch(() => null);
  const timeRange = body?.timeRange;
  if (
    !RANGES.includes(timeRange) ||
    !Array.isArray(body?.topTracks) ||
    !Array.isArray(body?.topArtists)
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await ensureUser(ctx.db, ctx.spotifyId);
  const since = new Date(Date.now() - SNAPSHOT_THROTTLE_MS);
  const recent = await ctx.db
    .select({ id: listeningSnapshots.id })
    .from(listeningSnapshots)
    .where(
      and(
        eq(listeningSnapshots.spotifyId, ctx.spotifyId),
        eq(listeningSnapshots.timeRange, timeRange),
        gt(listeningSnapshots.capturedAt, since),
      ),
    )
    .limit(1);
  if (recent.length > 0) {
    return NextResponse.json({ recorded: false, reason: "throttled" });
  }
  await ctx.db.insert(listeningSnapshots).values({
    spotifyId: ctx.spotifyId,
    timeRange,
    topTracks: body.topTracks,
    topArtists: body.topArtists,
  });
  return NextResponse.json({ recorded: true }, { status: 201 });
}
