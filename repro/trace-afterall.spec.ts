import { test, expect, type BrowserContext, type Page } from '@playwright/test';

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  page = await context.newPage();
  await page.goto('https://playwright.dev/docs/intro');
  await expect(page.getByRole('heading', { name: 'Installation', exact: true })).toBeVisible();
});

test('test body passes; only afterAll fails', async () => {
  await page.getByRole('main').getByRole('link', { name: /Next\s+Writing tests/ }).click();
  await expect(page).toHaveURL('https://playwright.dev/docs/writing-tests');
  await expect(page.getByRole('heading', { name: 'Writing tests', exact: true })).toBeVisible();
});

test.afterAll(async () => {
  await context?.close();
  throw new Error('Intentional afterAll failure to reproduce missing browser trace snapshots');
});
