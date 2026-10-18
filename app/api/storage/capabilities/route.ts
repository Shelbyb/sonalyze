import { NextResponse } from "next/server";
import { getCapabilities, BROWSER_CAPABILITIES } from "@/lib/storage/config";
import { isDbReachable } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const caps = getCapabilities();
  if (caps.mode === "postgres" && !(await isDbReachable())) {
    return NextResponse.json({
      ...BROWSER_CAPABILITIES,
      warning:
        "DATABASE_URL is set but the database is unreachable. Falling back to browser storage.",
    });
  }
  return NextResponse.json(caps);
}
