import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';
import crypto from 'node:crypto';

process.env.DAYWALKER_API_KEY = 'srv_live_test_valid_key_12345';
process.env.DAYWALKER_SERVICE_SLUG = 'sonalyze';
process.env.DAYWALKER_AUTH_URL = 'https://auth.daywalker.dev';
process.env.NEXTAUTH_SECRET = 'test-secret-min-32-chars-long-abcdef123456';

// Mock window.HTMLMediaElement.prototype
window.HTMLMediaElement.prototype.play = vi
  .fn()
  .mockImplementation(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useParams: () => ({ id: 'test-track-123' }),
  useSearchParams: () =>
    new URLSearchParams(
      typeof window !== 'undefined' && window.location.search
        ? window.location.search
        : 'error=Unauthorized&status=401',
    ),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({
    data: {
      user: {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      accessToken: 'mock-access-token',
    },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

const DEFAULT_LICENSE_KEY =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function createMockSealedBundle(
  serviceSlug = 'sonalyze',
  salt = 'default-test-salt-123',
) {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(DEFAULT_LICENSE_KEY, 'hex');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plain = JSON.stringify({
    serviceSlug,
    dataKeySalt: salt,
    features: {},
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  });
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

// Default global fetch handler for Daywalker Auth endpoints
const originalFetch = global.fetch;
global.fetch = vi
  .fn()
  .mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : (url as any)?.url || url.toString();

    if (urlStr.includes('/oauth/token')) {
      return new Response(
        JSON.stringify({
          access_token: 'tok_jwt_test',
          refresh_token: 'ref_jwt_test',
          token_type: 'DPoP',
          expires_in: 3600,
          refresh_expires_in: 86400,
          scope: 'sonalyze',
          services: ['sonalyze'],
          licenses: {
            sonalyze: {
              licenseKey: DEFAULT_LICENSE_KEY,
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
            },
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (urlStr.includes('/bundle')) {
      return new Response(
        JSON.stringify({
          serviceSlug: 'sonalyze',
          bundle: createMockSealedBundle(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (originalFetch) {
      return originalFetch(url, init);
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
