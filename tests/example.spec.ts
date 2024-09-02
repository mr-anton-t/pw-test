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
