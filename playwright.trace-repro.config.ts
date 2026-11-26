import { defineConfig, devices } from '@playwright/test';

const traceMode = process.env.TRACE_MODE ?? 'retain-on-failure';
if (traceMode !== 'retain-on-failure' && traceMode !== 'on') {
  throw new Error(`Unsupported TRACE_MODE: ${traceMode}`);
}

export default defineConfig({
  testDir: './repro',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  outputDir: `test-results/trace-${traceMode}`,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: `playwright-report/trace-${traceMode}` }],
    ['json', { outputFile: `test-results/trace-${traceMode}/results.json` }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    trace: traceMode,
  },
});
