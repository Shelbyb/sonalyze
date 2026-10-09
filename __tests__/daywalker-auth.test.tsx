import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import crypto from 'node:crypto';
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
  resolveDynamicOrigin,
  validateServiceToken,
  requireServiceAuth,
  clearServiceAuthCache,
  ServiceAuthError,
  CACHE_TTL_MS,
  getDaywalkerSigningKey,
  getDaywalkerJwks,
  getSigningDomain,
  buildSignedRequestHeaders,
} from '@/lib/daywalker-auth';
import { GET as jwksGet } from '@/app/.well-known/daywalker-keys.json/route';
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

  it('resolves dynamic origins from input, host headers, request URLs, and environment variables without trusting spoofed client headers', async () => {
    // 1. Explicit origin parameter
    expect(await resolveDynamicOrigin({ origin: 'https://custom-domain.org' })).toBe('https://custom-domain.org');
    expect(await resolveDynamicOrigin({ origin: 'custom-domain.org' })).toBe('https://custom-domain.org');
    expect(await resolveDynamicOrigin({ origin: 'localhost:8080' })).toBe('http://localhost:8080');

    // 2. Ignores spoofed client headers like x-caller-origin, origin, referer
    delete process.env.APP_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL_URL;

    const reqWithSpoofedClientHeaders = new Request('http://localhost:3000/api/health', {
      headers: {
        'x-caller-origin': 'https://spoofed-whitelisted-site.com',
        'x-origin': 'https://spoofed-whitelisted-site.com',
        'origin': 'https://spoofed-whitelisted-site.com',
        'referer': 'https://spoofed-whitelisted-site.com/some/path',
      },
    });
    // Should NOT resolve to the spoofed site; should resolve to server URL or localhost
    expect(await resolveDynamicOrigin({ req: reqWithSpoofedClientHeaders })).toBe('http://localhost:3000');

    // 3. From Request with authentic destination Host headers
    const reqWithHost = new Request('http://localhost:3000/api/health', {
      headers: {
        'x-forwarded-host': 'sonalyze.daywalker.dev',
        'x-forwarded-proto': 'https',
      },
    });
    expect(await resolveDynamicOrigin({ req: reqWithHost })).toBe('https://sonalyze.daywalker.dev');

    const reqWithUrlOnly = new Request('https://192.168.1.100:3000/dashboard');
    expect(await resolveDynamicOrigin({ req: reqWithUrlOnly })).toBe('https://192.168.1.100:3000');

    // 4. From server-authoritative environment variables (highest priority)
    process.env.APP_URL = 'https://app-url.example.com';
    expect(await resolveDynamicOrigin()).toBe('https://app-url.example.com');
    // Even if req has a host header, server env variable wins for tamper-proof resolution
    expect(await resolveDynamicOrigin({ req: reqWithHost })).toBe('https://app-url.example.com');

    delete process.env.APP_URL;
    process.env.NEXTAUTH_URL = 'https://nextauth.example.com';
    expect(await resolveDynamicOrigin()).toBe('https://nextauth.example.com');

    delete process.env.NEXTAUTH_URL;
    process.env.VERCEL_URL = 'preview-branch.vercel.app';
    expect(await resolveDynamicOrigin()).toBe('https://preview-branch.vercel.app');

    delete process.env.VERCEL_URL;
    expect(await resolveDynamicOrigin()).toBe('http://localhost:3000');
  });

  it('sends token and serviceSlug in body and caller origin headers during validation according to API docs', async () => {
    process.env.DAYWALKER_API_KEY = 'valid_token_123';
    let capturedHeaders: HeadersInit | undefined;
    let capturedBody: any;

    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedHeaders = init?.headers;
      capturedBody = JSON.parse(init?.body);
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', '120');
      headers.set('X-RateLimit-Remaining', '115');
      headers.set('X-RateLimit-Reset', '1775000000');
      headers.set('X-Service-Stage', 'testing');
      return {
        ok: true,
        status: 200,
        headers,
        json: async () => ({
          valid: true,
          serviceSlug: 'sonalyze',
          tokenId: 'tok_123',
          tokenName: 'Sonalyze Production',
          userId: 'usr_abc',
        }),
      };
    });

    const res = await validateServiceToken({ origin: 'https://my-custom-node.example.org:8443' });
    expect(res.valid).toBe(true);
    expect(capturedBody).toEqual({
      token: 'valid_token_123',
      serviceSlug: 'sonalyze',
    });
    expect((capturedHeaders as any)['Origin']).toBe('https://my-custom-node.example.org:8443');
    expect((capturedHeaders as any)['Referer']).toBe('https://my-custom-node.example.org:8443');
    expect((capturedHeaders as any)['X-Caller-Origin']).toBe('https://my-custom-node.example.org:8443');
    // Non-spec headers must not be sent; unsigned requests carry no X-Daywalker-* headers
    expect((capturedHeaders as any)['X-Forwarded-Host']).toBeUndefined();
    expect((capturedHeaders as any)['X-Origin']).toBeUndefined();
    expect((capturedHeaders as any)['X-Daywalker-Signature']).toBeUndefined();
    expect((capturedHeaders as any)['User-Agent']).toBe('Sonalyze-Auth-Gate/1.0');

    // Header extraction
    expect(res.data?.stage).toBe('testing');
    expect(res.data?.rateLimit).toEqual({
      limit: 120,
      remaining: 115,
      reset: 1775000000,
    });
  });

  describe('domain request signing', () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
    const pkcs8Der = privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64');
    const pkcs8Pem = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();

    function verify(headers: Record<string, string>, body: string, method = 'POST', path = '/api/v1/tokens/validate') {
      const payload = [
        'daywalker-v1',
        method,
        path,
        headers['X-Daywalker-Domain'],
        headers['X-Daywalker-Timestamp'],
        headers['X-Daywalker-Nonce'],
        crypto.createHash('sha256').update(body).digest('hex'),
      ].join('\n');
      return crypto.verify(null, Buffer.from(payload), publicKey, Buffer.from(headers['X-Daywalker-Signature'], 'base64url'));
    }

    it('loads base64 DER, escaped PEM, and encrypted keys; rejects non-ed25519 keys', () => {
      process.env.DAYWALKER_SIGNING_KEY = pkcs8Der;
      const fromDer = getDaywalkerSigningKey();
      expect(fromDer?.publicJwk).toMatchObject({ kty: 'OKP', crv: 'Ed25519', alg: 'EdDSA', use: 'sig' });
      expect(fromDer?.publicJwk.x).toBe((publicKey.export({ format: 'jwk' }) as { x: string }).x);

      process.env.DAYWALKER_SIGNING_KEY = pkcs8Pem.replace(/\n/g, '\\n');
      expect(getDaywalkerSigningKey()?.publicJwk.kid).toBe(fromDer?.publicJwk.kid);

      process.env.DAYWALKER_SIGNING_KEY = encrypt(pkcs8Der);
      expect(getDaywalkerSigningKey()?.publicJwk.kid).toBe(fromDer?.publicJwk.kid);

      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      process.env.DAYWALKER_SIGNING_KEY = crypto
        .generateKeyPairSync('ec', { namedCurve: 'P-256' })
        .privateKey.export({ format: 'der', type: 'pkcs8' })
        .toString('base64');
      expect(getDaywalkerSigningKey()).toBeNull();
      expect(errSpy).toHaveBeenCalled();

      delete process.env.DAYWALKER_SIGNING_KEY;
      expect(getDaywalkerSigningKey()).toBeNull();
      expect(getDaywalkerJwks()).toEqual({ keys: [] });
    });

    it('produces spec-compliant signed headers', () => {
      process.env.DAYWALKER_SIGNING_KEY = pkcs8Der;
      const key = getDaywalkerSigningKey()!;
      const body = '{"token":"t","serviceSlug":"sonalyze"}';
      const headers = buildSignedRequestHeaders({ method: 'post', path: '/api/v1/tokens/validate', domain: 'sonalyze.daywalker.dev', body, key });

      expect(headers['X-Daywalker-Domain']).toBe('sonalyze.daywalker.dev');
      expect(headers['X-Daywalker-Key-Id']).toBe(key.publicJwk.kid);
      expect(Math.abs(Number(headers['X-Daywalker-Timestamp']) - Date.now() / 1000)).toBeLessThan(5);
      expect(headers['X-Daywalker-Nonce']).toMatch(/^[A-Za-z0-9_-]{16,128}$/);
      expect(verify(headers, body)).toBe(true);
      expect(verify(headers, body + ' ')).toBe(false);
    });

    it('resolves the signing domain from env override or origin hostname, skipping local hosts', () => {
      expect(getSigningDomain('https://sonalyze.daywalker.dev:8443')).toBe('sonalyze.daywalker.dev');
      expect(getSigningDomain('http://localhost:3000')).toBeNull();
      expect(getSigningDomain('http://127.0.0.1:3000')).toBeNull();
      process.env.DAYWALKER_SIGNING_DOMAIN = 'sonalyze.daywalker.dev';
      expect(getSigningDomain('http://localhost:3000')).toBe('sonalyze.daywalker.dev');
    });

    it('signs the exact validate request body when a signing key is configured', async () => {
      process.env.DAYWALKER_API_KEY = 'srv_live_signed';
      process.env.DAYWALKER_SIGNING_KEY = pkcs8Der;
      let captured: { headers: Record<string, string>; body: string; url: string } | undefined;
      global.fetch = vi.fn().mockImplementation(async (url, init) => {
        captured = { headers: init.headers, body: init.body, url: String(url) };
        return { ok: true, status: 200, json: async () => ({ valid: true, serviceSlug: 'sonalyze' }) };
      });

      const res = await validateServiceToken({ origin: 'https://sonalyze.daywalker.dev' });
      expect(res.valid).toBe(true);
      expect(captured!.url).toBe('https://auth.daywalker.dev/api/v1/tokens/validate');
      expect(captured!.headers['X-Daywalker-Domain']).toBe('sonalyze.daywalker.dev');
      expect(verify(captured!.headers, captured!.body)).toBe(true);
    });

    it('serves the public JWKS at /.well-known/daywalker-keys.json', async () => {
      process.env.DAYWALKER_SIGNING_KEY = pkcs8Der;
      const res = jwksGet();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.keys).toHaveLength(1);
      expect(json.keys[0]).toEqual(getDaywalkerSigningKey()!.publicJwk);
      expect(json.keys[0].d).toBeUndefined();
    });

    it('lets the JWKS path bypass the service auth middleware', async () => {
      delete process.env.DAYWALKER_API_KEY;
      const res = await middleware(new NextRequest('http://localhost:3000/.well-known/daywalker-keys.json'));
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });
  });

  it('maintains distinct cache entries for different caller origins', async () => {
    process.env.DAYWALKER_API_KEY = 'valid_token_cache';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ valid: true, serviceSlug: 'sonalyze' }),
    });
    global.fetch = fetchMock;

    await validateServiceToken({ origin: 'https://site-a.com' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Call from site-a should hit cache
    await validateServiceToken({ origin: 'https://site-a.com' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Call from site-b should perform a new fetch
    await validateServiceToken({ origin: 'https://site-b.com' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
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

  it('handles 403 Forbidden with allowedOrigins details', async () => {
    process.env.DAYWALKER_API_KEY = 'forbidden_token';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers(),
      json: async () => ({
        valid: false,
        error: 'Forbidden',
        message: "Caller 'unauthorized-domain.com' is not allowed for this API token.",
        allowedOrigins: ['sonalyze.daywalker.dev', '127.0.0.1'],
      }),
    });

    const res = await validateServiceToken();
    expect(res.valid).toBe(false);
    expect(res.status).toBe(403);
    expect(res.error).toBe('Forbidden');
    expect(res.data?.allowedOrigins).toEqual(['sonalyze.daywalker.dev', '127.0.0.1']);
  });

  it('handles 429 Too Many Requests with Retry-After header and rateLimit details', async () => {
    process.env.DAYWALKER_API_KEY = 'rate_limited_token';
    const headers = new Headers();
    headers.set('Retry-After', '45');
    headers.set('X-RateLimit-Limit', '60');
    headers.set('X-RateLimit-Remaining', '0');
    headers.set('X-RateLimit-Reset', '1775000060');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers,
      json: async () => ({
        valid: false,
        error: 'Too Many Requests',
        message: "Rate limit of 60 req/min exceeded for service 'sonalyze'",
        rateLimit: {
          limit: 60,
          remaining: 0,
          reset: 1775000060,
        },
      }),
    });

    const res = await validateServiceToken();
    expect(res.valid).toBe(false);
    expect(res.status).toBe(429);
    expect(res.error).toBe('Too Many Requests');
    expect(res.data?.retryAfter).toBe(45);
    expect(res.data?.rateLimit?.limit).toBe(60);
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
