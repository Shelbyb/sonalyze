import { NextResponse } from 'next/server';
import { getDaywalkerJwks } from '@/lib/daywalker-auth';

export const dynamic = 'force-dynamic';

// Public Ed25519 JWKS fetched by Daywalker Auth to verify our X-Daywalker-Signature headers
export function GET() {
  return NextResponse.json(getDaywalkerJwks(), {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
