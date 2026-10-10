import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

process.env.DAYWALKER_API_KEY = 'srv_live_test_valid_key_12345';
process.env.DAYWALKER_SERVICE_SLUG = 'sonalyze';
process.env.DAYWALKER_AUTH_URL = 'https://auth.daywalker.dev';
process.env.NEXTAUTH_SECRET = 'test-secret-min-32-chars-long-abcdef123456';

// Mock window.HTMLMediaElement.prototype
window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
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
  useSearchParams: () => new URLSearchParams(typeof window !== 'undefined' && window.location.search ? window.location.search : 'error=Unauthorized&status=401'),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({
    data: {
      user: { name: 'Alex Johnson', email: 'alex@example.com', image: 'https://example.com/avatar.jpg' },
      accessToken: 'mock-access-token',
    },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Default global fetch handler for Daywalker Auth validate endpoint
const originalFetch = global.fetch;
global.fetch = vi.fn().mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
  const urlStr = typeof url === 'string' ? url : url.toString();
  if (urlStr.includes('auth.daywalker.dev/api/v1/tokens/validate')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        valid: true,
        serviceSlug: 'sonalyze',
        tokenId: 'tok_test123',
        tokenName: 'Test Key',
      }),
    } as Response;
  }
  if (originalFetch) {
    return originalFetch(url, init);
  }
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
  } as Response;
});
