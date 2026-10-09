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
  getResolvedServiceApiKey,
  getDaywalkerAuthUrl,
  getDaywalkerServiceSlug,
  validateServiceToken,
  requireServiceAuth,
  clearServiceAuthCache,
  ServiceAuthError,
  CACHE_TTL_MS,
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

  it('performs timingSafeEqual comparisons accurately', () => {
    expect(timingSafeEqual('exact-match', 'exact-match')).toBe(true);
    expect(timingSafeEqual('exact-match', 'mismatch')).toBe(false);
    expect(timingSafeEqual('short', 'longer-string')).toBe(false);
  });
});

describe('Daywalker Auth Client (lib/daywalker-auth.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    clearServiceAuthCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    clearServiceAuthCache();
    vi.restoreAllMocks();
  });

  it('resolves raw and encrypted service API keys', () => {
    process.env.DAYWALKER_API_KEY = 'raw_api_key_test';
    expect(getResolvedServiceApiKey()).toBe('raw_api_key_test');

    const encrypted = encrypt('decrypted_key_from_env');
    process.env.DAYWALKER_API_KEY = encrypted;
    expect(getResolvedServiceApiKey()).toBe('decrypted_key_from_env');

    delete process.env.DAYWALKER_API_KEY;
    delete process.env.DAYWALKER_SERVICE_TOKEN;
    delete process.env.SERVICE_API_KEY;
    expect(getResolvedServiceApiKey()).toBeNull();
  });

  it('returns canonical auth URL and service slug', () => {
    process.env.DAYWALKER_AUTH_URL = 'https://custom-auth.example.com/';
    process.env.DAYWALKER_SERVICE_SLUG = 'custom-slug';
    expect(getDaywalkerAuthUrl()).toBe('https://custom-auth.example.com');
    expect(getDaywalkerServiceSlug()).toBe('custom-slug');
  });

  it('fails with 401 when API key is missing', async () => {
    delete process.env.DAYWALKER_API_KEY;
    delete process.env.DAYWALKER_SERVICE_TOKEN;
    delete process.env.SERVICE_API_KEY;

    const res = await validateServiceToken();
    expect(res.valid).toBe(false);
    expect(res.status).toBe(401);
    expect(res.error).toBe('Unauthorized');
  });

  it('validates active token and caches result within TTL', async () => {
    process.env.DAYWALKER_API_KEY = 'valid_test_token';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        valid: true,
        serviceSlug: 'sonalyze',
        tokenId: 'tok_1',
      }),
    });
    global.fetch = fetchMock;

    const res1 = await validateServiceToken();
    expect(res1.valid).toBe(true);
    expect(res1.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Immediate second call should hit the in-memory cache
    const res2 = await validateServiceToken();
    expect(res2.valid).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Force refresh should bypass cache
    const res3 = await validateServiceToken({ forceRefresh: true });
    expect(res3.valid).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('handles invalid token response and clears cache', async () => {
    process.env.DAYWALKER_API_KEY = 'invalid_test_token';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        valid: false,
        error: 'InvalidToken',
        message: 'The token provided is invalid.',
      }),
    });

    const res = await validateServiceToken();
    expect(res.valid).toBe(false);
    expect(res.status).toBe(401);
    expect(res.error).toBe('InvalidToken');
  });

  it('handles abort timeouts gracefully and returns 503', async () => {
    process.env.DAYWALKER_API_KEY = 'timeout_test_token';
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    global.fetch = vi.fn().mockRejectedValue(abortErr);

    const res = await validateServiceToken();
    expect(res.valid).toBe(false);
    expect(res.status).toBe(503);
    expect(res.error).toBe('Request Timeout');
  });

  it('handles network failure gracefully and returns 503', async () => {
    process.env.DAYWALKER_API_KEY = 'network_fail_token';
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const res = await validateServiceToken();
    expect(res.valid).toBe(false);
    expect(res.status).toBe(503);
    expect(res.error).toBe('Service Unavailable');
  });

  it('requireServiceAuth succeeds on valid token and throws ServiceAuthError on invalid token', async () => {
    process.env.DAYWALKER_API_KEY = 'valid_token';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ valid: true }),
    });

    await expect(requireServiceAuth()).resolves.toBeUndefined();

    clearServiceAuthCache();
    delete process.env.DAYWALKER_API_KEY;
    await expect(requireServiceAuth()).rejects.toThrow(ServiceAuthError);
  });
});

describe('Service Error Screen (app/service-error/page.tsx)', () => {
  it('renders error status, message, and troubleshooting instructions', () => {
    render(<ServiceErrorPage />);
    expect(screen.getByText(/Service Authorization Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Troubleshooting Steps/i)).toBeInTheDocument();
    expect(screen.getByText(/DAYWALKER_API_KEY/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry Authorization/i })).toBeInTheDocument();
  });

  it('handles retry button interaction', async () => {
    render(<ServiceErrorPage />);
    const retryBtn = screen.getByRole('button', { name: /Retry Authorization/i });
    fireEvent.click(retryBtn);
    expect(screen.getByText(/Re-evaluating\.\.\./i)).toBeInTheDocument();
  });
});

describe('Perimeter Middleware (middleware.ts)', () => {
  beforeEach(() => {
    clearServiceAuthCache();
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

  it('redirects web traffic to /service-error when unauthenticated', async () => {
    delete process.env.DAYWALKER_API_KEY;
    delete process.env.DAYWALKER_SERVICE_TOKEN;
    delete process.env.SERVICE_API_KEY;

    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/service-error');
  });

  it('returns JSON error response for API routes when unauthenticated', async () => {
    delete process.env.DAYWALKER_API_KEY;
    delete process.env.DAYWALKER_SERVICE_TOKEN;
    delete process.env.SERVICE_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/auth/session');
    const res = await middleware(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('redirects /service-error back to / if token is valid', async () => {
    process.env.DAYWALKER_API_KEY = 'valid_key';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ valid: true }),
    });

    const req = new NextRequest('http://localhost:3000/service-error');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/');
  });
});
