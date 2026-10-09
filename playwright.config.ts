import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node .next/standalone/server.js',
    url: 'http://localhost:3000',
    env: {
      NEXTAUTH_SECRET: 'test-secret-at-least-32-characters-long-for-testing',
      NEXTAUTH_URL: 'http://localhost:3000',
      SPOTIFY_CLIENT_ID: 'test_client_id',
      SPOTIFY_CLIENT_SECRET: 'test_client_secret',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
});
