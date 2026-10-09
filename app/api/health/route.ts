import { NextResponse } from 'next/server';
import { validateServiceToken } from '@/lib/daywalker-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const serviceAuth = await validateServiceToken().catch(() => ({
    valid: false,
    status: 503,
    error: 'Service Check Error',
  }));

  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      serviceAuth: {
        valid: serviceAuth.valid,
        status: serviceAuth.status,
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
