import { expect, test } from '@playwright/test';

import { bootScene } from './helpers';

test.describe('boot', () => {
  test(
    'loads the intro, enters, and mounts the live canvas + HUD',
    { tag: '@ci' },
    async ({ page }) => {
      await page.goto('/?debug=1&bloom=0', { waitUntil: 'load' });

      // The crawlable CV is always in the DOM, even before the canvas is ready.
      await expect(
        page.getByRole('heading', { name: /Nick de Rozarieux/i }).first(),
      ).toBeAttached();

      await bootScene(page);

      // Canvas is mounted and sized; the burger nav is available on the overview.
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      const box = await canvas.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThan(0);
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
    },
  );
});
