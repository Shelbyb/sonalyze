import { NextResponse } from 'next/server';
import { requireServiceAuth, requireServiceLicense } from '@/lib/daywalker-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireServiceAuth({ req: request });
    await requireServiceLicense();

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        serviceAuth: {
          valid: true,
          status: 200,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: err?.message || 'Service check failed',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
