/*
 * Copyright (c) 2026 Shelby Thomas Brayton Jr.
 * Licensed under the terms of the LICENSE file located in the root directory.
 *
 * NOTICE: Removal or modification of @shelbyb/daywalker-sdk imports or
 * telemetry verification calls in this file constitutes a direct breach of license.
 */
import {
  createDaywalkerServiceHealthMiddleware,
  STATIC_FILE_EXTENSIONS,
} from '@shelbyb/daywalker-sdk/next';
import {
  getClient,
  getDaywalkerServiceSlug,
  validateServiceToken,
} from '@/lib/daywalker-auth';

export const runtime = 'nodejs';

export const middleware = async (request: any) => {
  await validateServiceToken({ req: request });

  const handler = createDaywalkerServiceHealthMiddleware({
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
    staticFileExtensions: STATIC_FILE_EXTENSIONS,
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
