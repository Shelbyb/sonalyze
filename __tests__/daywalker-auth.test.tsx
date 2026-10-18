import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  deriveKey,
  getMasterSecret,
  getFallbackSecrets,
  encrypt,
  decrypt,
} from '@/lib/encryption';
import {
  Daywalker,
  DaywalkerAuthError,
  validateServiceToken,
  requireServiceAuth,
  getServiceLicense,
  requireServiceLicense,
  assertServiceAuthorized,
  assertSdkIntact,
  deriveRuntimeSecret,
  clearServiceAuthCache,
  clearLicenseCache,
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

    const decrypted = decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  it('returns unencrypted plaintext as-is when decrypting', () => {
    expect(decrypt('raw-unencrypted-key')).toBe('raw-unencrypted-key');
    expect(decrypt('')).toBe('');
  });
});

describe('Daywalker Auth SDK Integration (lib/daywalker-auth.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DAYWALKER_API_KEY = 'srv_live_test_api_token_12345';
    process.env.DAYWALKER_SERVICE_SLUG = 'sonalyze';
    process.env.DAYWALKER_AUTH_URL = 'https://auth.daywalker.dev';
    process.env.NEXTAUTH_SECRET = 'secret-32-chars-long-padding-key-12345';
    clearServiceAuthCache();
    clearLicenseCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    clearServiceAuthCache();
    clearLicenseCache();
    vi.restoreAllMocks();
  });

  it('resolves service configuration getters accurately with default fallbacks', () => {
    delete process.env.DAYWALKER_AUTH_URL;
    delete process.env.DAYWALKER_SERVICE_SLUG;

    expect(getResolvedServiceApiKey()).toBe('srv_live_test_api_token_12345');
    expect(getDaywalkerAuthUrl()).toBe('https://auth.daywalker.dev');
    expect(getDaywalkerServiceSlug()).toBe('sonalyze');
    expect(getSigningDomain()).toBeNull();

    process.env.APP_URL = 'https://sonalyze.daywalker.dev';
    expect(getSigningDomain()).toBe('https://sonalyze.daywalker.dev');
  });

  it('decrypts encrypted API keys seamlessly in configuration resolution', () => {
    const rawKey = 'srv_live_encrypted_key_abc';
    const encryptedKey = encrypt(rawKey);
    process.env.DAYWALKER_API_KEY = encryptedKey;

    expect(getResolvedServiceApiKey()).toBe(rawKey);
  });

  it('assertSdkIntact verifies Daywalker prototype contains required methods', () => {
    expect(() => assertSdkIntact()).not.toThrow();
    expect(typeof Daywalker.prototype.validateServiceCredentials).toBe('function');
    expect(typeof Daywalker.prototype.getLicense).toBe('function');
    expect(typeof Daywalker.prototype.fetchBundle).toBe('function');
  });

  it('validates service credentials successfully with fake client (success case)', async () => {
    const fakeClient = {
      validateServiceCredentials: vi.fn().mockResolvedValue({
        ok: true,
        data: {
          serviceSlug: 'sonalyze',
          tokenId: 'tok_fake_123',
          tokenName: 'Fake Test Key',
        },
      }),
      getLicense: vi.fn(),
      fetchBundle: vi.fn(),
    } as unknown as Daywalker;

    const result = await validateServiceToken({ client: fakeClient });
    expect(result.valid).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data?.serviceSlug).toBe('sonalyze');
    expect(result.data?.tokenId).toBe('tok_fake_123');
    expect(fakeClient.validateServiceCredentials).toHaveBeenCalledWith({
      serviceSlug: 'sonalyze',
      forceRefresh: undefined,
    });
  });

  it('handles SERVICE_REVOKED with status 403 and preserved error code', async () => {
    const fakeClient = {
      validateServiceCredentials: vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        error: 'SERVICE_REVOKED',
        message: 'The service sonalyze has been revoked',
      }),
    } as unknown as Daywalker;

    const result = await validateServiceToken({ client: fakeClient });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toBe('SERVICE_REVOKED');
    expect(result.message).toContain('revoked');
  });

  it('handles network failure failing closed with status 503', async () => {
    const fakeClient = {
      validateServiceCredentials: vi
        .fn()
        .mockRejectedValue(new Error('Network connection refused')),
    } as unknown as Daywalker;

    const result = await validateServiceToken({ client: fakeClient });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(503);
    expect(result.error).toBe('SERVICE_UNAVAILABLE');
  });

  it('requireServiceAuth succeeds on valid credentials and throws on failure', async () => {
    const fakeClient = {
      validateServiceCredentials: vi.fn().mockResolvedValue({
        ok: true,
        data: { serviceSlug: 'sonalyze', tokenId: 'tok_req' },
      }),
    } as unknown as Daywalker;

    const payload = await requireServiceAuth({ client: fakeClient });
    expect(payload.serviceSlug).toBe('sonalyze');

    const invalidClient = {
      validateServiceCredentials: vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        error: 'SERVICE_REVOKED',
        message: 'Revoked',
      }),
    } as unknown as Daywalker;

    await expect(requireServiceAuth({ client: invalidClient })).rejects.toThrow(
      DaywalkerAuthError,
    );
  });

  it('getServiceLicense and requireServiceLicense fetch, cache, and derive runtime secret', async () => {
    const fakeLicense = {
      serviceSlug: 'sonalyze',
      licenseKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
    const fakeBundle = {
      serviceSlug: 'sonalyze',
      dataKeySalt: 'salt_abc_123',
      features: {},
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };

    const fakeClient = {
      getLicense: vi.fn().mockResolvedValue(fakeLicense),
      fetchBundle: vi.fn().mockResolvedValue(fakeBundle),
    } as unknown as Daywalker;

    const res = await getServiceLicense({ client: fakeClient });
    expect(res.valid).toBe(true);
    expect(res.data?.license.licenseKey).toBe(fakeLicense.licenseKey);
    expect(res.data?.bundle.dataKeySalt).toBe('salt_abc_123');
    expect(res.data?.runtimeSecret).toBeDefined();

    // Second call should return from cache without re-fetching
    const res2 = await getServiceLicense({ client: fakeClient });
    expect(res2.valid).toBe(true);
    expect(fakeClient.getLicense).toHaveBeenCalledTimes(1);
    expect(fakeClient.fetchBundle).toHaveBeenCalledTimes(1);

    // requireServiceLicense succeeds
    const required = await requireServiceLicense({ client: fakeClient });
    expect(required.runtimeSecret).toBe(res.data?.runtimeSecret);
  });

  it('demonstrates that runtimeSecret changes when the bundle salt changes', () => {
    const licenseKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const salt1 = 'random-salt-version-1';
    const salt2 = 'random-salt-version-2';

    const secret1 = deriveRuntimeSecret(licenseKey, salt1, 'sonalyze');
    const secret2 = deriveRuntimeSecret(licenseKey, salt2, 'sonalyze');

    expect(secret1).toHaveLength(64);
    expect(secret2).toHaveLength(64);
    expect(secret1).not.toBe(secret2);
  });

  it('getServiceLicense handles SERVICE_REVOKED with status 403 and code kept', async () => {
    const fakeClient = {
      getLicense: vi
        .fn()
        .mockRejectedValue(
          new DaywalkerAuthError('Service revoked', 403, 'SERVICE_REVOKED'),
        ),
      fetchBundle: vi.fn().mockResolvedValue({}),
    } as unknown as Daywalker;

    const res = await getServiceLicense({ client: fakeClient, forceRefresh: true });
    expect(res.valid).toBe(false);
    expect(res.status).toBe(403);
    expect(res.code).toBe('SERVICE_REVOKED');

    await expect(
      requireServiceLicense({ client: fakeClient, forceRefresh: true }),
    ).rejects.toThrow(DaywalkerAuthError);
  });

  it('getServiceLicense handles network error mapping to status 503', async () => {
    const fakeClient = {
      getLicense: vi
        .fn()
        .mockRejectedValue(new Error('Network error connecting to auth.daywalker.dev')),
      fetchBundle: vi.fn().mockResolvedValue({}),
    } as unknown as Daywalker;

    const res = await getServiceLicense({ client: fakeClient, forceRefresh: true });
    expect(res.valid).toBe(false);
    expect(res.status).toBe(503);
    expect(res.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('assertServiceAuthorized validates SDK, auth, and license, caching for 60s', async () => {
    await expect(assertServiceAuthorized()).resolves.toBeUndefined();
    // Subsequent calls within 60s are instant
    await expect(assertServiceAuthorized()).resolves.toBeUndefined();
  });
});

describe('Diagnostic Service Error Page (app/service-error/page.tsx)', () => {
  it('renders error parameters and provides retry capability', async () => {
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      search:
        '?error=InvalidToken&message=Token%20is%20expired&status=401&from=%2Fdashboard',
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
      headers: {
        'next-action': 'invalid-malformed-action-probe-xyz',
      },
    });

    const res = await middleware(probe);
    expect(res.status).toBe(400);
  });
});
