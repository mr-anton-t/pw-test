import { test, expect } from '@playwright/test';

test.describe('Playwright installation documentation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/intro');
  });

  test('shows installation instructions and the npm command', async ({ page }) => {
    const main = page.getByRole('main');

    await expect(page).toHaveTitle(/Installation.*Playwright/);
    await expect(main.getByRole('heading', { name: 'Installation', exact: true })).toBeVisible();
    await expect(main.getByRole('heading', { name: /^Installing Playwright/, level: 2 })).toBeVisible();
    await expect(main.getByText('npm init playwright@latest', { exact: true })).toBeVisible();
  });

  test('navigates to the installation section', async ({ page }) => {
    const main = page.getByRole('main');

    await main.getByRole('link', { name: 'How to install Playwright', exact: true }).click();

    await expect(page).toHaveURL(/\/docs\/intro#installing-playwright$/);
    await expect(main.getByRole('heading', { name: /^Installing Playwright/, level: 2 })).toBeInViewport();
  });

  test('opens Writing tests from the next-page link', async ({ page }) => {
    await page.getByRole('main').getByRole('link', { name: /Next\s+Writing tests/ }).click();

    await expect(page).toHaveURL('https://playwright.dev/docs/writing-tests');
    await expect(page.getByRole('heading', { name: 'Writing tests', exact: true })).toBeVisible();
  });
});
