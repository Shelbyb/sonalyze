import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  deriveKey,
  getMasterSecret,
  getFallbackSecrets,
  encrypt,
  decrypt,
  isEncrypted,
  canDecrypt,
  reencrypt,
  encryptSensitiveFields,
  decryptSensitiveFields,
  timingSafeEqual,
} from '@/lib/encryption';
import {
  Daywalker,
  createDaywalker,
  DaywalkerAuthError,
  DaywalkerRateLimitError,
  validateServiceToken,
  requireServiceAuth,
  clearServiceAuthCache,
  ServiceAuthError,
  getDaywalkerClient,
  getClient,
  getResolvedServiceApiKey,
  getDaywalkerAuthUrl,
  getDaywalkerServiceSlug,
  getSigningDomain,
} from '@/lib/daywalker-auth';
import ServiceErrorPage from '@/app/service-error/page';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Encryption Utilities (lib/encryption.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NEXTAUTH_SECRET = 'test-secret-at-least-32-chars-key-12345';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('derives a consistent 32-byte key from secret', () => {
    const key1 = deriveKey('secret123456789012345678901234567890');
    const key2 = deriveKey('secret123456789012345678901234567890');
    expect(key1).toHaveLength(32);
    expect(key1.equals(key2)).toBe(true);
  });

  it('returns master and fallback secrets from environment', () => {
    process.env.ENCRYPTION_KEY = 'primary-key-1234567890123456789012';
    process.env.DAYWALKER_ENCRYPTION_KEY = 'fallback-key-123456789012345678';
    expect(getMasterSecret()).toBe('primary-key-1234567890123456789012');
    expect(getFallbackSecrets()).toContain('fallback-key-123456789012345678');
  });

  it('encrypts and decrypts strings correctly with AES-256-GCM', () => {
    const plaintext = 'dw_live_secret_key_123456789';
    const ciphertext = encrypt(plaintext);
    expect(ciphertext.startsWith('enc:v1:')).toBe(true);
    expect(isEncrypted(ciphertext)).toBe(true);
    expect(isEncrypted(plaintext)).toBe(false);

    const decrypted = decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  it('returns unencrypted plaintext as-is when decrypting', () => {
    expect(decrypt('raw-unencrypted-key')).toBe('raw-unencrypted-key');
    expect(decrypt('')).toBe('');
  });

  it('verifies decryption capability with canDecrypt and re-encrypts across keys', () => {
    const secretA = 'key-a-123456789012345678901234567890';
    const secretB = 'key-b-123456789012345678901234567890';
    const ciphertextA = encrypt('test-message', secretA);

    expect(canDecrypt(ciphertextA, secretA)).toBe(true);
    expect(canDecrypt(ciphertextA, secretB)).toBe(false);

    const ciphertextB = reencrypt(ciphertextA, secretA, secretB);
    expect(canDecrypt(ciphertextB, secretB)).toBe(true);
    expect(decrypt(ciphertextB, secretB)).toBe('test-message');
  });

  it('encrypts and decrypts sensitive object fields', () => {
    const data = {
      apiKey: 'secret_value',
      name: 'Public App',
      token: 'another_secret',
    };

    const encryptedData = encryptSensitiveFields(data, ['apiKey', 'token']);
    expect(isEncrypted(encryptedData.apiKey)).toBe(true);
    expect(isEncrypted(encryptedData.token)).toBe(true);
    expect(encryptedData.name).toBe('Public App');

    const decryptedData = decryptSensitiveFields(encryptedData, ['apiKey', 'token']);
    expect(decryptedData.apiKey).toBe('secret_value');
    expect(decryptedData.token).toBe('another_secret');
  });

  it('performs constant-time string comparison with timingSafeEqual', () => {
    expect(timingSafeEqual('exact-match', 'exact-match')).toBe(true);
    expect(timingSafeEqual('match-a', 'match-b')).toBe(false);
    expect(timingSafeEqual('short', 'longer-string')).toBe(false);
  });
});

describe('Daywalker Auth SDK Integration (lib/daywalker-auth.ts)', () => {
  const originalEnv = process.env;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DAYWALKER_API_KEY = 'srv_live_test_api_token_12345';
    process.env.DAYWALKER_SERVICE_SLUG = 'sonalyze';
    process.env.DAYWALKER_AUTH_URL = 'https://auth.daywalker.dev';
    process.env.NEXTAUTH_SECRET = 'secret-32-chars-long-padding-key-12345';
    clearServiceAuthCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    clearServiceAuthCache();
    vi.restoreAllMocks();
  });

  it('resolves service configuration getters accurately with default fallbacks', () => {
    delete process.env.DAYWALKER_AUTH_URL;
    delete process.env.DAYWALKER_SERVICE_SLUG;

    expect(getResolvedServiceApiKey()).toBe('srv_live_test_api_token_12345');
    expect(getDaywalkerAuthUrl()).toBe('https://auth.daywalker.dev');
    expect(getDaywalkerServiceSlug()).toBe('sonalyze');
    expect(getSigningDomain()).toBeNull();

    process.env.DAYWALKER_SIGNING_DOMAIN = 'sonalyze.daywalker.dev';
    expect(getSigningDomain()).toBe('sonalyze.daywalker.dev');
  });

  it('decrypts encrypted API keys seamlessly in configuration resolution', () => {
    const rawKey = 'srv_live_encrypted_key_abc';
    const encryptedKey = encrypt(rawKey);
    process.env.DAYWALKER_API_KEY = encryptedKey;

    expect(getResolvedServiceApiKey()).toBe(rawKey);
  });

  it('returns valid status and payload when Daywalker Auth returns 200 OK', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          valid: true,
          serviceSlug: 'sonalyze',
          tokenId: 'tok_123456',
          tokenName: 'Production App Token',
          rateLimit: { limit: 1000, remaining: 999, reset: 1700000000 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const result = await validateServiceToken();
    expect(result.valid).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data?.serviceSlug).toBe('sonalyze');
    expect(result.data?.tokenId).toBe('tok_123456');
  });

  it('caches token validation responses across multiple invocations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          valid: true,
          serviceSlug: 'sonalyze',
          tokenId: 'tok_cache_test',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    globalThis.fetch = fetchMock;

    const res1 = await validateServiceToken();
    const res2 = await validateServiceToken();

    expect(res1.valid).toBe(true);
    expect(res2.valid).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Force refresh bypasses cache
    await validateServiceToken({ forceRefresh: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('handles 401 InvalidToken from Daywalker Auth', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'InvalidToken',
          message: 'The token provided is invalid.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const result = await validateServiceToken();
    expect(result.valid).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe('INVALID_TOKEN');
    expect(result.message).toBe('The token provided is invalid.');
  });

  it('handles 403 Forbidden with origin authorization issues', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Caller origin not allowed for this API token.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const result = await validateServiceToken();
    expect(result.valid).toBe(false);
    expect(result.status).toBe(403);
  });

  it('handles 429 Too Many Requests with retry-after header', async () => {
    const customClient = createDaywalker({
      apiKey: 'srv_live_test_api_token_12345',
      serviceSlug: 'sonalyze',
      authUrl: 'https://auth.daywalker.dev',
      maxRetries: 0,
      retry: { maxRetries: 0, initialDelayMs: 0 },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded for service sonalyze',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '30',
          },
        }
      )
    );

    const result = await validateServiceToken({ client: customClient });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(429);
    expect(result.retryAfter).toBe(30);
  });

  it('returns missing credentials error when DAYWALKER_API_KEY is unset', async () => {
    delete process.env.DAYWALKER_API_KEY;
    delete process.env.DAYWALKER_SERVICE_TOKEN;
    delete process.env.SERVICE_API_KEY;

    const result = await validateServiceToken();
    expect(result.valid).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe('MissingCredentials');
  });

  it('requireServiceAuth succeeds on valid token and throws ServiceAuthError on invalid token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          valid: true,
          serviceSlug: 'sonalyze',
          tokenId: 'tok_require_test',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const payload = await requireServiceAuth();
    expect(payload.serviceSlug).toBe('sonalyze');
    expect(payload.tokenId).toBe('tok_require_test');

    clearServiceAuthCache();
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid API key',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await expect(requireServiceAuth()).rejects.toThrow(ServiceAuthError);
  });
});

describe('Diagnostic Service Error Page (app/service-error/page.tsx)', () => {
  it('renders error parameters and provides retry capability', async () => {
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      search: '?error=InvalidToken&message=Token%20is%20expired&status=401&from=%2Fdashboard',
      href: 'http://localhost:3000/service-error?error=InvalidToken&message=Token%20is%20expired&status=401&from=%2Fdashboard',
    } as any;

    render(<ServiceErrorPage />);

    expect(screen.getByText('Service Authorization Required')).toBeDefined();
    expect(screen.getByText(/Token is expired/)).toBeDefined();

    const retryButton = screen.getByRole('button', { name: /retry authorization/i });
    expect(retryButton).toBeDefined();

    fireEvent.click(retryButton);

    window.location = originalLocation;
  });
});

describe('Perimeter Middleware (middleware.ts)', () => {
  beforeEach(() => {
    clearServiceAuthCache();
    process.env.DAYWALKER_API_KEY = 'srv_live_test_api_token';
    process.env.DAYWALKER_SERVICE_SLUG = 'sonalyze';
  });

  afterEach(() => {
    clearServiceAuthCache();
    vi.restoreAllMocks();
  });

  it('bypasses static files and health check routes', async () => {
    const healthReq = new NextRequest('http://localhost:3000/api/health');
    const healthRes = await middleware(healthReq);
    expect(healthRes.status).toBe(200);

    const staticReq = new NextRequest('http://localhost:3000/_next/static/chunk.js');
    const staticRes = await middleware(staticReq);
    expect(staticRes.status).toBe(200);

    const imageReq = new NextRequest('http://localhost:3000/logo.png');
    const imageRes = await middleware(imageReq);
    expect(imageRes.status).toBe(200);
  });

  it('blocks malformed Server Action probes before routing', async () => {
    const probe = new NextRequest('http://localhost:3000/', {
      method: 'POST',
      headers: { 'Next-Action': 'x' },
    });
    const res = await middleware(probe);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Bad Request');
  });

  it('permits valid hex Server Action requests when authenticated', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ valid: true, serviceSlug: 'sonalyze' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const req = new NextRequest('http://localhost:3000/', {
      method: 'POST',
      headers: { 'Next-Action': '7f'.repeat(21) },
    });
    const res = await middleware(req);
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirects unauthorized UI requests to /service-error with sanitized params', async () => {
    delete process.env.DAYWALKER_API_KEY;
    clearServiceAuthCache();

    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/service-error');
  });

  it('returns 400/401 JSON for unauthorized API requests', async () => {
    delete process.env.DAYWALKER_API_KEY;
    clearServiceAuthCache();

    const req = new NextRequest('http://localhost:3000/api/auth/session');
    const res = await middleware(req);
    expect(res.status).toBeGreaterThanOrEqual(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('heals back to root when accessing /service-error with valid token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ valid: true, serviceSlug: 'sonalyze' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const req = new NextRequest('http://localhost:3000/service-error');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/');
  });
});
