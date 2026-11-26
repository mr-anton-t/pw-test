import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const cli = path.join(path.dirname(require.resolve('@playwright/test/package.json')), 'cli.js');
const mode = process.argv[2];
if (mode !== 'retain-on-failure' && mode !== 'on') {
  throw new Error('Choose retain-on-failure or on');
}

const result = spawnSync(process.execPath, [cli, 'test', '--config=playwright.trace-repro.config.ts'], {
  stdio: 'inherit',
  env: { ...process.env, TRACE_MODE: mode },
});
if (result.error) {
  throw result.error;
}
process.exit(result.status ?? 1);
