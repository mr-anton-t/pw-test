# Playwright tests

## Setup

Use Node.js 24 LTS.

```bash
npm ci
npx playwright install chromium
```

## Run

```bash
npm test
npm run test:docs
npm run typecheck
npm run report
```

The documentation tests check https://playwright.dev/docs/intro:

- The installation heading and npm initialization command.
- Navigation to the installation section.
- The next-page link to Writing tests.

Both existing Chromium projects are retained. Their viewport is explicitly
set to 1400 × 1300, including manually created contexts.

Failed tests retain traces. Reports and test results are local generated files
and are not committed.

## Reproduce missing trace snapshots after an afterAll failure

This reproduction uses the unmodified official Microsoft
`@playwright/test@1.65.1` package from npm. It does not use the trace fix,
a fork dependency, a preload hook, or mocked Playwright internals.

The test creates a context in `beforeAll`, opens the installation page, and
successfully navigates to Writing tests. Only `afterAll` intentionally fails.
The reproduction is separate from the normal test suite.

```bash
git clone --branch test/playwright-docs-intro https://github.com/mr-anton-t/pw-test.git
cd pw-test
npm ci
npx playwright install chromium

# Expected exit code: 1, caused only by the intentional afterAll error.
npm run repro:trace

# Expected exit code: 1 again, but this trace should contain the browser snapshots.
npm run repro:trace:on
```

Open each trace separately:

```bash
npx playwright show-report playwright-report/trace-retain-on-failure
npx playwright show-report playwright-report/trace-on
```

In Trace Viewer, select the click on **Next Writing tests** in the test body.
With `retain-on-failure`, its browser action and DOM snapshots are missing.
With `on`, the action and snapshots are present. The list of test-runner
steps can appear in both traces; this alone does not mean browser snapshots
were recorded.

Optionally verify the archive contents with Python 3 (no extra packages):

```bash
python3 scripts/inspect-trace.py test-results/trace-retain-on-failure test-results/trace-on
```

Expected: `browser_clicks` and `click_dom_snapshots` are zero for
`retain-on-failure` and nonzero for `on`.

Run the passing smoke suite independently:

```bash
npm test
npm run typecheck
```
