import {
  Daywalker,
  createDaywalker,
  daywalker as defaultDaywalker,
  DaywalkerError,
  DaywalkerAuthError,
  DaywalkerRateLimitError,
  type TokenPayload,
  type ValidateResult,
  type DaywalkerConfig,
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

export interface TokenValidationResponse extends TokenPayload {
  valid?: boolean;
}

export interface ServiceAuthResult {
  valid: boolean;
  status: number;
  error?: string;
  message?: string;
  data?: TokenPayload;
  retryAfter?: number;
}

export interface ValidateServiceTokenOptions {
  forceRefresh?: boolean;
  serviceSlug?: string;
  token?: string;
  origin?: string;
  req?: any;
  client?: Daywalker;
}

export const CACHE_TTL_MS = 60_000;
export const REQUEST_TIMEOUT_MS = 5_000;

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
      ''
  );
}

export function getDaywalkerAuthUrl(): string {
  return (process.env.DAYWALKER_AUTH_URL || 'https://auth.daywalker.dev').replace(/\/+$/, '');
}

export function getDaywalkerServiceSlug(): string {
  return (process.env.DAYWALKER_SERVICE_SLUG || 'sonalyze').trim().toLowerCase();
}

export function getSigningDomain(): string | null {
  return (
    process.env.DAYWALKER_SIGNING_DOMAIN ||
    process.env.DAYWALKER_DOMAIN ||
    process.env.APP_URL ||
    null
  );
}

let activeClient: Daywalker | null = null;

export function getDaywalkerClient(overrides: DaywalkerConfig = {}): Daywalker {
  const apiKey = overrides.apiKey ?? (getResolvedServiceApiKey() || undefined);
  const signingKey = overrides.signingKey ?? (resolveSecretValue(process.env.DAYWALKER_SIGNING_KEY) || undefined);
  const serviceSlug = overrides.serviceSlug ?? getDaywalkerServiceSlug();
  const domain = overrides.domain ?? getSigningDomain() ?? undefined;
  const authUrl = overrides.authUrl ?? getDaywalkerAuthUrl();
  const daywalkerPublicKey = overrides.daywalkerPublicKey ?? (process.env.DAYWALKER_PUBLIC_KEY || undefined);
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

export function clearServiceAuthCache(): void {
  activeClient = null;
}

export const clearDaywalkerAuthCache = clearServiceAuthCache;

/**
 * Validates the service token with Daywalker Auth using the Daywalker SDK.
 */
export async function validateServiceToken(
  options: ValidateServiceTokenOptions = {}
): Promise<ServiceAuthResult> {
  const client = options.client ?? getClient();
  const serviceSlug = (options.serviceSlug ?? getDaywalkerServiceSlug()).toLowerCase();

  const token = options.token ?? getResolvedServiceApiKey() ?? undefined;
  if (!token) {
    return {
      valid: false,
      status: 401,
      error: 'MissingCredentials',
      message: 'DAYWALKER_API_KEY environment variable is not configured.',
    };
  }

  const result: ValidateResult = await client.validateToken(
    {
      token,
      serviceSlug,
      forceRefresh: options.forceRefresh,
    }
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
    status: result.status,
    error: result.error,
    message: result.message,
    retryAfter: result.retryAfter,
  };
}

/**
 * Enforces valid Daywalker service authentication.
 * Throws a DaywalkerAuthError / ServiceAuthError if token validation fails.
 */
export async function requireServiceAuth(
  options: ValidateServiceTokenOptions = {}
): Promise<TokenPayload> {
  const result = await validateServiceToken(options);
  if (!result.valid) {
    throw new DaywalkerAuthError(
      result.message || 'Daywalker service authorization check failed.',
      result.status || 401,
      result.error || 'UNAUTHORIZED'
    );
  }
  return result.data!;
}
