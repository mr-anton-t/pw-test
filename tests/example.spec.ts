import { test, expect } from '@playwright/test';

test('Check screen size', async ({ page }, testInfo) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);

  console.log("project name: ", testInfo.project.name)

  console.log('page.viewportSize() is ',  page.viewportSize());

  console.log('testInfo.project.use.viewport is ',  testInfo.project.use.viewport)

  expect( page.viewportSize()).toMatchObject({width: 1400, height: 1300})
});

test('should inherit use options on context when using built-in browser fixture', async ({browser,}) => {
  // test from https://playwright.dev/docs/test-use-options#explicit-context-creation-and-option-inheritance

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);

  expect(await page.evaluate(() => window.innerWidth)).toBe(1400);
  await context.close();
});