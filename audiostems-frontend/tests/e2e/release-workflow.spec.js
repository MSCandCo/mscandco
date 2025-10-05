import { test, expect } from '@playwright/test';

test.describe('User Dashboard Access', () => {
  test('distribution partner can access dashboard and navigate', async ({ page }) => {
    // Login as distribution partner
    await page.goto('/login');
    await page.fill('#email', 'codegroup@mscandco.com');
    await page.fill('#password', 'C0d3gr0up');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('/dashboard', { timeout: 60000 });

    // Verify distribution partner dashboard loaded
    await expect(page.locator('text=Distribution Partner')).toBeVisible({ timeout: 10000 });

    // Verify navigation elements are present
    await page.waitForSelector('nav', { timeout: 10000 });
    await expect(page.locator('a[href="/distributionpartner/dashboard"]')).toBeVisible();
  });

  test('company admin can access dashboard and navigate to workflow', async ({ page }) => {
    // Login as company admin
    await page.goto('/login');
    await page.fill('#email', 'companyadmin@mscandco.com');
    await page.fill('#password', 'ca@2025msC');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('/dashboard', { timeout: 60000 });

    // Verify company admin dashboard loaded
    await expect(page.locator('text=Company Admin')).toBeVisible({ timeout: 10000 });

    // Verify navigation to workflow page works
    await page.waitForSelector('nav', { timeout: 10000 });
    const workflowLink = page.locator('a[href="/companyadmin/distribution"]');
    await expect(workflowLink).toBeVisible();

    // Click workflow and verify it loads
    await workflowLink.click();
    await expect(page).toHaveURL('/companyadmin/distribution', { timeout: 10000 });
  });
});
