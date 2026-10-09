import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateServiceToken } from "@/lib/daywalker-auth";

export const runtime = "nodejs";

// Real Server Action IDs are hex hashes. Scanners probing for CVE-2025-55182 (React2Shell)
// send junk like `Next-Action: x`, which Next.js rejects with a logged
// "Server Reference ID did not match the expected format" error. Drop them up front.
const SERVER_ACTION_ID_PATTERN = /^[0-9a-f]{40,}$/i;

const BYPASS_PATHS = [
  "/api/health",
  "/healthz",
  "/favicon.ico",
  "/robots.txt",
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 0. Reject malformed Server Action requests before routing or auth checks
  const actionId = request.headers.get("next-action");
  if (actionId !== null && !SERVER_ACTION_ID_PATTERN.test(actionId)) {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid Server Action request." },
      { status: 400 }
    );
  }

  // 1. Bypass static files and health check probes
  if (
    BYPASS_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Validate token against Daywalker Auth using dynamic request origin
  const dynamicOrigin = request.nextUrl.origin;
  const authResult = await validateServiceToken({
    req: request,
    origin: dynamicOrigin,
  });

  // 3. Handle service error page route
  if (pathname === "/service-error") {
    if (authResult.valid) {
      // If the service token is now valid, heal/redirect back to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow rendering the error page
    return NextResponse.next();
  }

  // 4. Handle invalid token for all other routes
  if (!authResult.valid) {
    // API routes: return JSON error response
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
          message:
            authResult.message ||
            "Service authorization check failed with Daywalker Auth.",
        },
        {
          status: authResult.status || 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // Web routes: redirect to diagnostic service error screen
    const redirectUrl = new URL("/service-error", request.url);
    redirectUrl.searchParams.set("error", authResult.error || "Unauthorized");
    redirectUrl.searchParams.set(
      "message",
      authResult.message || "Service authorization check failed."
    );
    redirectUrl.searchParams.set("status", String(authResult.status || 401));
    if (pathname !== "/" || search) {
      redirectUrl.searchParams.set("from", `${pathname}${search}`);
    }

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
