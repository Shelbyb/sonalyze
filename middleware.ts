import { createDaywalkerMiddleware } from '@shelbyb/daywalker-sdk/next';
import { getClient, getDaywalkerServiceSlug } from '@/lib/daywalker-auth';

export const runtime = 'nodejs';

export const middleware = (request: any) => {
  const handler = createDaywalkerMiddleware({
    client: getClient(),
    serviceSlug: getDaywalkerServiceSlug(),
    errorPath: '/service-error',
    homePath: '/',
    bypassPaths: [
      '/api/health',
      '/healthz',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
    ],
    validateServerActions: true,
  });
  return handler(request);
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
