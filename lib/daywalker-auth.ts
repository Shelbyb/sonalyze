import { decrypt } from "@/lib/encryption";

export interface TokenValidationResponse {
  valid: boolean;
  serviceSlug?: string;
  tokenId?: string;
  tokenName?: string;
  userId?: string;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
  error?: string;
  message?: string;
  allowedOrigins?: string[];
}

export interface ServiceAuthResult {
  valid: boolean;
  status: number;
  error?: string;
  message?: string;
  data?: TokenValidationResponse;
}

export class ServiceAuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 401, code = "UNAUTHORIZED") {
    super(message);
    this.name = "ServiceAuthError";
    this.status = status;
    this.code = code;
  }
}

export interface ValidateServiceTokenOptions {
  forceRefresh?: boolean;
  origin?: string;
  req?: any;
}

interface CacheEntry {
  result: ServiceAuthResult;
  expiresAt: number;
}

const authCache = new Map<string, CacheEntry>();
export const CACHE_TTL_MS = 60_000; // 60s cache for valid tokens
export const REQUEST_TIMEOUT_MS = 5_000;

export function clearServiceAuthCache(): void {
  authCache.clear();
}

export function getResolvedServiceApiKey(): string | null {
  const rawKey =
    process.env.DAYWALKER_API_KEY ||
    process.env.DAYWALKER_SERVICE_TOKEN ||
    process.env.SERVICE_API_KEY ||
    "";

  const trimmed = rawKey.trim();
  if (!trimmed) return null;

  try {
    const decrypted = decrypt(trimmed);
    if (decrypted) return decrypted.trim();
  } catch {
    // Fallback to literal key if decryption fails
  }

  return trimmed;
}

export function getDaywalkerAuthUrl(): string {
  const url = process.env.DAYWALKER_AUTH_URL || "https://auth.daywalker.dev";
  return url.replace(/\/+$/, "");
}

export function getDaywalkerServiceSlug(): string {
  return (
    process.env.DAYWALKER_SERVICE_SLUG ||
    process.env.DAYWALKER_API_SERVICE ||
    "sonalyze"
  );
}

function cleanOrigin(raw: string): string {
  let trimmed = raw.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const isLocal =
      trimmed.includes("localhost") ||
      trimmed.startsWith("127.0.0.1") ||
      trimmed.startsWith("0.0.0.0");
    const proto = isLocal ? "http" : "https";
    trimmed = `${proto}://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

function extractOriginFromHeaders(headers: {
  get(name: string): string | null | undefined;
}): string | null {
  // SECURITY: Never read client-controlled headers like 'x-caller-origin', 'x-origin',
  // 'origin', or 'referer' from incoming HTTP requests. External callers can forge those headers
  // to fake a whitelisted origin. We only resolve from server-bound destination host and protocol.
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost || headers.get("host");
  if (host && host.trim()) {
    const cleanHost = host.split(",")[0].trim();
    // Validate host format (domain, IP, and optional port) to prevent injection
    if (!/^[a-zA-Z0-9.-]+(:\d+)?$/.test(cleanHost)) {
      return null;
    }
    const forwardedProto = headers.get("x-forwarded-proto");
    const isLocal =
      cleanHost.includes("localhost") ||
      cleanHost.startsWith("127.0.0.1") ||
      cleanHost.startsWith("0.0.0.0");
    const proto =
      forwardedProto?.split(",")[0].trim() ||
      (isLocal ? "http" : "https");
    return cleanOrigin(`${proto}://${cleanHost}`);
  }

  return null;
}

export async function resolveDynamicOrigin(input?: {
  origin?: string;
  req?: any;
}): Promise<string> {
  // 1. Explicit verified origin parameter
  if (input?.origin && typeof input.origin === "string" && input.origin.trim().length > 0) {
    return cleanOrigin(input.origin);
  }

  // 2. Server-authoritative environment variables (highest trust, tamper-proof from clients)
  const envUrl =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    process.env.SITE_URL ||
    process.env.PUBLIC_URL ||
    "";

  if (envUrl.trim()) {
    return cleanOrigin(envUrl.trim());
  }

  // 3. Extract from server-side request context
  if (input?.req) {
    const req = input.req;
    if (req.headers && typeof req.headers.get === "function") {
      const fromHeaders = extractOriginFromHeaders(req.headers);
      if (fromHeaders) return fromHeaders;
    }
    if (req.nextUrl && req.nextUrl.origin && req.nextUrl.origin !== "null") {
      return cleanOrigin(req.nextUrl.origin);
    }
    if (typeof req.url === "string" && req.url.trim()) {
      try {
        const parsed = new URL(req.url);
        if (parsed.origin && parsed.origin !== "null") {
          return parsed.origin;
        }
      } catch {
        // ignore
      }
    }
  }

  // 4. Attempt to read from Next.js server headers (in App Router server components / route handlers)
  try {
    const { headers } = await import("next/headers");
    const headerList = await headers();
    if (headerList && typeof headerList.get === "function") {
      const fromHeaders = extractOriginFromHeaders(headerList);
      if (fromHeaders) return fromHeaders;
    }
  } catch {
    // Expected outside of active request context
  }

  // 5. Default local fallback
  return "http://localhost:3000";
}

export async function validateServiceToken(
  options?: ValidateServiceTokenOptions
): Promise<ServiceAuthResult> {
  // During Next.js static prerendering build phase, bypass external network check
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { valid: true, status: 200 };
  }

  const token = getResolvedServiceApiKey();
  if (!token) {
    const failure: ServiceAuthResult = {
      valid: false,
      status: 401,
      error: "Unauthorized",
      message: "Missing Daywalker API Key. Please configure DAYWALKER_API_KEY in your environment.",
    };
    return failure;
  }

  const resolvedOrigin = await resolveDynamicOrigin(options);
  const cacheKey = `${token}:${resolvedOrigin}`;
  const now = Date.now();
  const cached = authCache.get(cacheKey);

  if (!options?.forceRefresh && cached && cached.expiresAt > now && cached.result.valid) {
    return cached.result;
  }

  let hostOnly: string;
  try {
    hostOnly = new URL(resolvedOrigin).host;
  } catch {
    hostOnly = resolvedOrigin.replace(/^https?:\/\//, "").split("/")[0];
  }

  const authUrl = getDaywalkerAuthUrl();
  const serviceSlug = getDaywalkerServiceSlug();
  const endpoint = `${authUrl}/api/v1/tokens/validate`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: resolvedOrigin,
        Referer: resolvedOrigin,
        "X-Caller-Origin": resolvedOrigin,
        "X-Origin": resolvedOrigin,
        "X-Forwarded-Host": hostOnly,
      },
      body: JSON.stringify({
        token,
        serviceSlug,
        origin: resolvedOrigin,
        callerOrigin: resolvedOrigin,
        domain: hostOnly,
        host: hostOnly,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = (await response.json().catch(() => ({}))) as TokenValidationResponse;

    if (response.ok && data.valid === true) {
      const success: ServiceAuthResult = {
        valid: true,
        status: response.status,
        data,
      };
      authCache.set(cacheKey, {
        result: success,
        expiresAt: now + CACHE_TTL_MS,
      });
      return success;
    }

    const failure: ServiceAuthResult = {
      valid: false,
      status: response.status || 401,
      error: data.error || (response.status === 401 ? "Unauthorized" : "Service Validation Error"),
      message:
        data.message ||
        (response.status === 401
          ? "Invalid or unauthorized service API key."
          : `Daywalker token validation failed with status ${response.status}.`),
      data,
    };

    authCache.delete(cacheKey);
    return failure;
  } catch (error) {
    authCache.delete(cacheKey);
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      valid: false,
      status: 503,
      error: isAbort ? "Request Timeout" : "Service Unavailable",
      message: isAbort
        ? "Daywalker token validation request timed out."
        : `Failed to connect to Daywalker authentication service: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
    };
  }
}

export async function requireServiceAuth(
  options?: ValidateServiceTokenOptions
): Promise<void> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }
  const result = await validateServiceToken(options);
  if (!result.valid) {
    throw new ServiceAuthError(
      result.message || "Service authorization check failed.",
      result.status || 401,
      result.error || "UNAUTHORIZED"
    );
  }
}
