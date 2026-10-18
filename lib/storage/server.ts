import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/getSession";
import { getDb, getReadDb } from "@/lib/db/client";

export async function requireUserDb() {
  const session = (await getAuthSession()) as any;
  const spotifyId: string | undefined = session?.spotifyId;
  if (!spotifyId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }
  const db = getDb();
  if (!db) {
    return {
      error: NextResponse.json(
        { error: "Database storage is not enabled" },
        { status: 503 },
      ),
    } as const;
  }
  return { spotifyId, db, readDb: getReadDb() ?? db } as const;
}
