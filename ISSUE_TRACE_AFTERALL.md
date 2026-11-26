# [Bug]: retain-on-failure drops browser actions and DOM snapshots when only afterAll fails

## Version

1.65.1, installed from the official npm `@playwright/test` package.

## Environment

- macOS 15.5, Apple Silicon.
- Node.js 24.22.2.
- Chromium installed with `npx playwright install chromium`.
- One worker, no retries.
- No fork dependency, custom tracing hooks, or runtime patches.

## Steps to reproduce

Reproduction repository: https://github.com/mr-anton-t/pw-test

Branch: `test/playwright-docs-intro`

```bash
git clone --branch test/playwright-docs-intro https://github.com/mr-anton-t/pw-test.git
cd pw-test
npm ci
npx playwright install chromium
npm run repro:trace
```

The test intentionally fails in `afterAll`, so exit code 1 is expected.
The test body itself should pass.

Open the report:

```bash
npx playwright show-report playwright-report/trace-retain-on-failure
```

Open its trace and select the click on **Next Writing tests** in the test body.
Observe that the corresponding browser action and DOM snapshots are missing,
although the test-runner step is listed.

Compare with `trace: 'on'`:

```bash
npm run repro:trace:on
npx playwright show-report playwright-report/trace-on
```

This run also intentionally exits with code 1, but its trace includes the
browser click and associated DOM snapshots.

To inspect the ZIP contents without Trace Viewer (Python 3, standard library only):

```bash
python3 scripts/inspect-trace.py test-results/trace-retain-on-failure test-results/trace-on
```

## Minimal test

```ts
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
```

The reproduction configuration sets `use.trace` to `retain-on-failure`.
The comparison command sets it to `on`.

## Expected behavior

A failure in `afterAll` should retain the test body's browser actions, DOM
snapshots, and screencast frames, just as a failure in the test body does.

## Actual behavior

The report marks the test as failed and lists the test-runner steps, but
the trace does not contain the test body's browser click or its DOM snapshots.
Some `beforeAll` snapshots may remain, making the trace appear partially recorded.

Switching only the trace mode to `on` preserves the missing browser data.

Verified locally with the official 1.65.1 package:

| Trace mode | Browser clicks | DOM snapshots for the click | Total DOM snapshots |
| --- | ---: | ---: | ---: |
| `retain-on-failure` | 0 | 0 | 4 |
| `on` | 1 | 3 | 11 |

Both runs failed only with the intentional `afterAll` error. The ordinary
smoke suite passed all 10 tests, and TypeScript checking passed.

## Investigation

Test-scoped fixture teardown stops browser trace chunks before `afterAll`
executes. In retain modes, the current result can still be successful at
that point, so those chunks are discarded. A later `afterAll` failure
changes the final result but cannot recover the discarded trace chunks.

Related reports, not necessarily the same root cause: microsoft/playwright#31541,
microsoft/playwright#28527, and microsoft/playwright#32377.
