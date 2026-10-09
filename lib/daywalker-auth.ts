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

interface CacheEntry {
  result: ServiceAuthResult;
  expiresAt: number;
}

let authCache: CacheEntry | null = null;
export const CACHE_TTL_MS = 60_000; // 60s cache for valid tokens
export const REQUEST_TIMEOUT_MS = 5_000;

export function clearServiceAuthCache(): void {
  authCache = null;
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

export async function validateServiceToken(options?: {
  forceRefresh?: boolean;
}): Promise<ServiceAuthResult> {
  // During Next.js static prerendering build phase, bypass external network check
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return { valid: true, status: 200 };
  }

  const now = Date.now();

  if (!options?.forceRefresh && authCache && authCache.expiresAt > now && authCache.result.valid) {
    return authCache.result;
  }

  const token = getResolvedServiceApiKey();
  if (!token) {
    const failure: ServiceAuthResult = {
      valid: false,
      status: 401,
      error: "Unauthorized",
      message: "Missing Daywalker API Key. Please configure DAYWALKER_API_KEY in your environment.",
    };
    authCache = null;
    return failure;
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
      },
      body: JSON.stringify({
        token,
        serviceSlug,
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
      authCache = {
        result: success,
        expiresAt: now + CACHE_TTL_MS,
      };
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

    authCache = null;
    return failure;
  } catch (error) {
    authCache = null;
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

export async function requireServiceAuth(): Promise<void> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  const result = await validateServiceToken();
  if (!result.valid) {
    throw new ServiceAuthError(
      result.message || "Service authorization check failed.",
      result.status || 401,
      result.error || "UNAUTHORIZED"
    );
  }
}
