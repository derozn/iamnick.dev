import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

/**
 * E2E against a production build. The scene is WebGL, so chromium runs on ANGLE
 * + SwiftShader (software GL) for deterministic headless rendering — colour/fps
 * are unreliable there, so canvas assertions are programmatic (non-black, POIs
 * differ), never pixel-diff; DOM overlays get real pixel-diff. The server runs
 * with FORTUNE_STUB=1 so Madame Zara streams a canned Reading (no tokens).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist',
      ],
    },
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !CI,
    timeout: 180_000,
    env: { FORTUNE_STUB: '1' },
  },
});
