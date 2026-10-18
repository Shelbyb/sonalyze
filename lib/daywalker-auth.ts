import crypto from 'node:crypto';
import {
  Daywalker,
  createDaywalker,
  DaywalkerError,
  DaywalkerAuthError,
  DaywalkerRateLimitError,
  type TokenPayload,
  type ValidateResult,
  type DaywalkerConfig,
  type License,
  type ConfigBundle,
} from '@shelbyb/daywalker-sdk';
import { decrypt } from '@/lib/encryption';

export {
  Daywalker,
  createDaywalker,
  DaywalkerError,
  DaywalkerAuthError,
  DaywalkerRateLimitError,
};

export { DaywalkerAuthError as ServiceAuthError };

export interface ServiceAuthResult {
  valid: boolean;
  status: number;
  error?: string;
  message?: string;
  data?: TokenPayload;
  retryAfter?: number;
}

export interface ServiceLicenseResult {
  valid: boolean;
  status: number;
  code?: string;
  error?: string;
  message?: string;
  data?: {
    license: License;
    bundle: ConfigBundle;
    runtimeSecret: string;
    expiresAt: number;
    serviceSlug: string;
  };
}

export interface ValidateServiceTokenOptions {
  forceRefresh?: boolean;
  serviceSlug?: string;
  token?: string;
  origin?: string;
  req?: any;
  client?: Daywalker;
}

export function assertSdkIntact(): void {
  if (
    !Daywalker ||
    typeof Daywalker.prototype?.validateServiceCredentials !== 'function' ||
    typeof Daywalker.prototype?.getLicense !== 'function' ||
    typeof Daywalker.prototype?.fetchBundle !== 'function'
  ) {
    throw new DaywalkerAuthError(
      'Daywalker SDK prototype integrity compromised',
      503,
      'SDK_INTEGRITY_COMPROMISED',
    );
  }
}

function resolveSecretValue(rawValue: string | undefined | null): string | null {
  if (!rawValue) return null;
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  try {
    const decrypted = decrypt(trimmed);
    if (decrypted) return decrypted.trim();
  } catch {
    // Fallback to literal value
  }

  return trimmed;
}

export function getResolvedServiceApiKey(): string | null {
  return resolveSecretValue(
    process.env.DAYWALKER_API_KEY ||
      process.env.DAYWALKER_SERVICE_TOKEN ||
      process.env.SERVICE_API_KEY ||
      '',
  );
}

export function getDaywalkerAuthUrl(): string {
  return (process.env.DAYWALKER_AUTH_URL || 'https://auth.daywalker.dev').replace(
    /\/+$/,
    '',
  );
}

export function getDaywalkerServiceSlug(): string {
  return (process.env.DAYWALKER_SERVICE_SLUG || 'sonalyze').trim().toLowerCase();
}

export function getSigningDomain(): string | null {
  return process.env.APP_URL || null;
}

let activeClient: Daywalker | null = null;

export function getDaywalkerClient(overrides: DaywalkerConfig = {}): Daywalker {
  const apiKey = overrides.apiKey ?? (getResolvedServiceApiKey() || undefined);
  const signingKey =
    overrides.signingKey ??
    (resolveSecretValue(process.env.DAYWALKER_SIGNING_KEY) || undefined);
  const serviceSlug = overrides.serviceSlug ?? getDaywalkerServiceSlug();
  const domain = overrides.domain ?? getSigningDomain() ?? undefined;
  const authUrl = overrides.authUrl ?? getDaywalkerAuthUrl();
  const daywalkerPublicKey =
    overrides.daywalkerPublicKey ?? (process.env.DAYWALKER_PUBLIC_KEY || undefined);
  const keyId = overrides.keyId ?? (process.env.DAYWALKER_KEY_ID || undefined);

  return createDaywalker({
    apiKey,
    signingKey,
    serviceSlug,
    domain,
    authUrl,
    daywalkerPublicKey,
    keyId,
    ...overrides,
  });
}

export function getClient(): Daywalker {
  if (!activeClient) {
    activeClient = getDaywalkerClient();
  }
  return activeClient;
}

let cachedLicenseData: {
  license: License;
  bundle: ConfigBundle;
  runtimeSecret: string;
  expiresAt: number;
  serviceSlug: string;
} | null = null;

let lastAuthorizedTime = 0;
const AUTH_CACHE_TTL_MS = 60_000;

export function clearServiceAuthCache(): void {
  activeClient = null;
  cachedLicenseData = null;
  lastAuthorizedTime = 0;
}

export function clearLicenseCache(): void {
  cachedLicenseData = null;
  lastAuthorizedTime = 0;
}

export function deriveRuntimeSecret(
  licenseKey: string,
  salt: string,
  serviceSlug: string = getDaywalkerServiceSlug(),
): string {
  const ikm = licenseKey;
  const saltBuf = Buffer.from(salt, 'utf-8');
  const infoBuf = Buffer.from(`${serviceSlug}-runtime-v1`, 'utf-8');
  const derived = crypto.hkdfSync('sha256', ikm, saltBuf, infoBuf, 32);
  return Buffer.from(derived).toString('hex');
}

export function getCachedRuntimeSecret(): string | null {
  if (cachedLicenseData && Date.now() < cachedLicenseData.expiresAt - 60_000) {
    return cachedLicenseData.runtimeSecret;
  }
  return null;
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 5000,
  errorMsg = 'Operation timed out',
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new DaywalkerAuthError(errorMsg, 503, 'SERVICE_UNAVAILABLE'));
    }, timeoutMs);
    timer.unref?.();
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Validates the service credentials with Daywalker Auth using the Daywalker SDK.
 */
export async function validateServiceToken(
  options: ValidateServiceTokenOptions = {},
): Promise<ServiceAuthResult> {
  try {
    assertSdkIntact();
    const client = options.client ?? getClient();
    const serviceSlug = (options.serviceSlug ?? getDaywalkerServiceSlug()).toLowerCase();

    const result: ValidateResult = await withTimeout(
      client.validateServiceCredentials({
        serviceSlug,
        forceRefresh: options.forceRefresh,
      }),
      5000,
      'Service validation timed out',
    );

    if (result.ok) {
      return {
        valid: true,
        status: 200,
        data: result.data,
      };
    }

    return {
      valid: false,
      status: result.status || 503,
      error: result.error,
      message: result.message,
      retryAfter: result.retryAfter,
    };
  } catch (err: any) {
    const status =
      err instanceof DaywalkerAuthError || err?.status ? err.status || 503 : 503;
    const error = err?.code || err?.error || 'SERVICE_UNAVAILABLE';
    return {
      valid: false,
      status: status >= 400 && status < 600 ? status : 503,
      error,
      message: err?.message || 'Service authorization error',
    };
  }
}

/**
 * Enforces valid Daywalker service authentication.
 * Throws a DaywalkerAuthError / ServiceAuthError if token validation fails.
 */
export async function requireServiceAuth(
  options: ValidateServiceTokenOptions = {},
): Promise<TokenPayload> {
  const result = await validateServiceToken(options);
  if (!result.valid) {
    throw new DaywalkerAuthError(
      result.message || 'Daywalker service authorization check failed.',
      result.status || 503,
      result.error || 'UNAUTHORIZED',
    );
  }
  return result.data!;
}

/**
 * Retrieves and caches the service license and config bundle from Daywalker Auth.
 */
export async function getServiceLicense(
  options: {
    serviceSlug?: string;
    forceRefresh?: boolean;
    client?: Daywalker;
  } = {},
): Promise<ServiceLicenseResult> {
  try {
    assertSdkIntact();
    const client = options.client ?? getClient();
    const serviceSlug = (options.serviceSlug ?? getDaywalkerServiceSlug()).toLowerCase();

    const now = Date.now();
    if (
      !options.forceRefresh &&
      cachedLicenseData &&
      cachedLicenseData.serviceSlug === serviceSlug &&
      now < cachedLicenseData.expiresAt - 60_000
    ) {
      return {
        valid: true,
        status: 200,
        data: cachedLicenseData,
      };
    }

    const [license, bundle] = await withTimeout(
      Promise.all([
        client.getLicense({ serviceSlug, forceRefresh: options.forceRefresh }),
        client.fetchBundle({ serviceSlug, forceRefresh: options.forceRefresh }),
      ]),
      5000,
      'License fetch timed out',
    );

    const licenseExpires = new Date(license.expiresAt).getTime();
    const bundleExpires = new Date(bundle.expiresAt).getTime();
    const earliestExpiry = Math.min(
      Number.isFinite(licenseExpires) ? licenseExpires : now + 3600_000,
      Number.isFinite(bundleExpires) ? bundleExpires : now + 3600_000,
    );

    const runtimeSecret = deriveRuntimeSecret(
      license.licenseKey,
      bundle.dataKeySalt,
      serviceSlug,
    );

    const data = {
      license,
      bundle,
      runtimeSecret,
      expiresAt: earliestExpiry,
      serviceSlug,
    };

    cachedLicenseData = data;

    return {
      valid: true,
      status: 200,
      data,
    };
  } catch (err: any) {
    if (err instanceof DaywalkerAuthError) {
      return {
        valid: false,
        status: err.status || 403,
        code: err.code || 'LICENSE_ERROR',
        error: err.code || 'LICENSE_ERROR',
        message: err.message,
      };
    }
    const status = err?.status || 503;
    const code = err?.code || 'SERVICE_UNAVAILABLE';
    return {
      valid: false,
      status,
      code,
      error: code,
      message: err?.message || 'Failed to obtain service license',
    };
  }
}

/**
 * Enforces valid Daywalker service license.
 * Throws a DaywalkerAuthError if licensing fails.
 */
export async function requireServiceLicense(
  options: {
    serviceSlug?: string;
    forceRefresh?: boolean;
    client?: Daywalker;
  } = {},
): Promise<{
  license: License;
  bundle: ConfigBundle;
  runtimeSecret: string;
  expiresAt: number;
}> {
  const result = await getServiceLicense(options);
  if (!result.valid || !result.data) {
    throw new DaywalkerAuthError(
      result.message || 'Service licensing verification failed.',
      result.status || 503,
      result.code || result.error || 'LICENSE_UNAVAILABLE',
    );
  }
  return result.data;
}

/**
 * Asserts that the service is authorized and properly licensed.
 * Cached for 60 seconds; skipped outside server runtime and during next build.
 */
export async function assertServiceAuthorized(): Promise<void> {
  if (typeof window !== 'undefined') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  const now = Date.now();
  if (now - lastAuthorizedTime < AUTH_CACHE_TTL_MS) {
    return;
  }

  assertSdkIntact();
  await requireServiceAuth();
  await requireServiceLicense();
  lastAuthorizedTime = Date.now();
}
