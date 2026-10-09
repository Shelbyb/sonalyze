import crypto from "node:crypto";
import { decrypt } from "@/lib/encryption";

export interface TokenValidationResponse {
  valid: boolean;
  serviceSlug?: string;
  tokenId?: string;
  tokenName?: string;
  userId?: string;
  stage?: "draft" | "testing" | "live" | string;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
  error?: string;
  message?: string;
  allowedOrigins?: string[];
  retryAfter?: number;
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

function resolveSecretValue(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  try {
    const decrypted = decrypt(trimmed);
    if (decrypted) return decrypted.trim();
  } catch {
    // Fallback to literal value if decryption fails
  }

  return trimmed;
}

export function getResolvedServiceApiKey(): string | null {
  return resolveSecretValue(
    process.env.DAYWALKER_API_KEY ||
      process.env.DAYWALKER_SERVICE_TOKEN ||
      process.env.SERVICE_API_KEY ||
      ""
  );
}

// --- Domain request signing (X-Daywalker-* headers) ---
// Per https://auth.daywalker.dev/docs, domain/wildcard allowlist entries only match a
// *proven* hostname. Signing each validate request with an Ed25519 key whose public half
// is published at https://<domain>/.well-known/daywalker-keys.json works from any host/CDN,
// unlike Origin headers which require the domain's DNS to point at our egress IP.

export const SIGNATURE_VERSION = "daywalker-v1";
export const VALIDATE_PATH = "/api/v1/tokens/validate";

export interface DaywalkerSigningKey {
  privateKey: crypto.KeyObject;
  publicJwk: { kty: "OKP"; crv: "Ed25519"; x: string; kid: string; use: "sig"; alg: "EdDSA" };
}

let signingKeyCache: { source: string; key: DaywalkerSigningKey | null } | null = null;

/**
 * Loads the Ed25519 signing key from DAYWALKER_SIGNING_KEY. Accepts a PKCS#8 PEM
 * (literal "\n" escapes allowed), base64-encoded PKCS#8 DER, or an `enc:v1:` encrypted
 * form of either. Returns null when signing is not configured.
 */
export function getDaywalkerSigningKey(): DaywalkerSigningKey | null {
  const source = process.env.DAYWALKER_SIGNING_KEY || "";
  if (signingKeyCache && signingKeyCache.source === source) return signingKeyCache.key;

  let key: DaywalkerSigningKey | null = null;
  const resolved = resolveSecretValue(source);
  if (resolved) {
    try {
      const privateKey = resolved.includes("-----BEGIN")
        ? crypto.createPrivateKey(resolved.replace(/\\n/g, "\n"))
        : crypto.createPrivateKey({ key: Buffer.from(resolved, "base64"), format: "der", type: "pkcs8" });
      if (privateKey.asymmetricKeyType !== "ed25519") {
        throw new Error(`expected an ed25519 key, got ${privateKey.asymmetricKeyType}`);
      }
      const { x } = crypto.createPublicKey(privateKey).export({ format: "jwk" }) as { x: string };
      // RFC 7638 JWK thumbprint as a stable key id
      const kid = crypto
        .createHash("sha256")
        .update(JSON.stringify({ crv: "Ed25519", kty: "OKP", x }))
        .digest("base64url");
      key = { privateKey, publicJwk: { kty: "OKP", crv: "Ed25519", x, kid, use: "sig", alg: "EdDSA" } };
    } catch (error) {
      console.error(
        "[daywalker-auth] DAYWALKER_SIGNING_KEY is set but could not be loaded; requests will be unsigned.",
        error instanceof Error ? error.message : error
      );
    }
  }

  signingKeyCache = { source, key };
  return key;
}

/** Public JWKS served at /.well-known/daywalker-keys.json */
export function getDaywalkerJwks(): { keys: DaywalkerSigningKey["publicJwk"][] } {
  const key = getDaywalkerSigningKey();
  return { keys: key ? [key.publicJwk] : [] };
}

export function buildSignedRequestHeaders(params: {
  method: string;
  path: string;
  domain: string;
  body: string;
  key: DaywalkerSigningKey;
  timestamp?: number;
  nonce?: string;
}): Record<string, string> {
  const timestamp = String(params.timestamp ?? Math.floor(Date.now() / 1000));
  const nonce = params.nonce ?? crypto.randomBytes(24).toString("base64url");
  const bodyHash = crypto.createHash("sha256").update(params.body).digest("hex");
  const payload = [
    SIGNATURE_VERSION,
    params.method.toUpperCase(),
    params.path,
    params.domain,
    timestamp,
    nonce,
    bodyHash,
  ].join("\n");
  const signature = crypto.sign(null, Buffer.from(payload), params.key.privateKey).toString("base64url");

  return {
    "X-Daywalker-Domain": params.domain,
    "X-Daywalker-Key-Id": params.key.publicJwk.kid,
    "X-Daywalker-Timestamp": timestamp,
    "X-Daywalker-Nonce": nonce,
    "X-Daywalker-Signature": signature,
  };
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

/**
 * Domain whose /.well-known/daywalker-keys.json publishes our public key. Prefers the
 * explicit DAYWALKER_SIGNING_DOMAIN; otherwise uses the resolved origin's hostname.
 * Local hosts are skipped since the auth server can't fetch their JWKS.
 */
export function getSigningDomain(resolvedOrigin: string): string | null {
  const explicit = process.env.DAYWALKER_SIGNING_DOMAIN?.trim();
  if (explicit) return explicit;
  try {
    const { hostname } = new URL(resolvedOrigin);
    if (!hostname || hostname === "localhost" || hostname === "0.0.0.0" || hostname.startsWith("127.")) {
      return null;
    }
    return hostname;
  } catch {
    return null;
  }
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

  const authUrl = getDaywalkerAuthUrl();
  const serviceSlug = getDaywalkerServiceSlug();
  const endpoint = `${authUrl}${VALIDATE_PATH}`;
  // The signature covers the exact body bytes, so serialize once and send this string
  const body = JSON.stringify({ token, serviceSlug });

  // Origin / Referer / X-Caller-Origin are the spec's unsigned hostname hints (DNS-matched)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Sonalyze-Auth-Gate/1.0",
    Origin: resolvedOrigin,
    Referer: resolvedOrigin,
    "X-Caller-Origin": resolvedOrigin,
  };

  const signingKey = getDaywalkerSigningKey();
  const signingDomain = getSigningDomain(resolvedOrigin);
  if (signingKey && signingDomain) {
    Object.assign(
      headers,
      buildSignedRequestHeaders({
        method: "POST",
        path: VALIDATE_PATH,
        domain: signingDomain,
        body,
        key: signingKey,
      })
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });

    const data = (await response.json().catch(() => ({}))) as TokenValidationResponse;

    // Extract headers safely (supporting mock responses in tests without full Headers instances)
    const rateLimitLimit = response.headers?.get ? response.headers.get("X-RateLimit-Limit") : null;
    const rateLimitRemaining = response.headers?.get ? response.headers.get("X-RateLimit-Remaining") : null;
    const rateLimitReset = response.headers?.get ? response.headers.get("X-RateLimit-Reset") : null;
    const serviceStage = response.headers?.get ? response.headers.get("X-Service-Stage") : null;
    const retryAfter = response.headers?.get ? response.headers.get("Retry-After") : null;

    if (serviceStage && !data.stage) {
      data.stage = serviceStage;
    }

    if (!data.rateLimit && rateLimitLimit) {
      data.rateLimit = {
        limit: parseInt(rateLimitLimit, 10),
        remaining: parseInt(rateLimitRemaining || "0", 10),
        reset: parseInt(rateLimitReset || "0", 10),
      };
    }

    if (retryAfter && !data.retryAfter) {
      data.retryAfter = parseInt(retryAfter, 10);
    }

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
  } finally {
    clearTimeout(timeoutId);
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
