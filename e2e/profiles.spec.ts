import { expect, test } from '@playwright/test';

test.describe('experience profiles', () => {
  // Reduced motion → the 'none' tier: no canvas, the sr-only CV becomes the
  // visible page. Runs on desktop only (the assertion is about the tier, not size).
  test('reduced motion renders the CV document instead of the canvas', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'load' });

    await expect(page.getByRole('heading', { name: /Nick de Rozarieux/i }).first()).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    await context.close();
  });

  test('the mobile (Lite) viewport boots and shows the nav', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Lite profile is the mobile project');
    await page.goto('/?debug=1&bloom=0', { waitUntil: 'load' });
    await expect
      .poll(() => page.evaluate(() => window.__sceneStore?.getState().sceneReady === true), {
        timeout: 45_000,
      })
      .toBe(true);
    await page.evaluate(() => window.__sceneStore!.getState().start());
    await expect(page.locator('canvas')).toBeVisible();
  });
});
