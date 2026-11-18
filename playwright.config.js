import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.js',
  timeout: 60_000,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4322', trace: 'off' },
  webServer: { command: 'node scripts/serve.mjs 4322', url: 'http://localhost:4322/', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    // iPhone 13 screen, touch and user agent, rendered with Chromium
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
});
