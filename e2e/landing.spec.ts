import { test, expect } from '@playwright/test';

test.describe('Sonalyze Landing Page', () => {
  test('displays brand header, title, and Spotify connect action', async ({ page }) => {
    await page.goto('/');

    // Check title and brand name
    await expect(page).toHaveTitle(/Sonalyze — See your sound/i);
    await expect(page.locator('header')).toContainText('Sonalyze');

    // Check Hero Section
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/See the shape/i);

    // Check Login CTA buttons
    const loginButtons = page.getByRole('button', { name: /Log in with Spotify/i });
    await expect(loginButtons.first()).toBeVisible();

    // Check feature cards
    await expect(page.getByRole('heading', { name: 'Top tracks & previews' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Audio DNA' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Taste profile' })).toBeVisible();
  });

  test('redirects unauthenticated users attempting to access dashboard to landing page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/?$/);
  });
});
