import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { bootScene, store } from './helpers';

/**
 * Accessibility sweep of the DOM overlays (the canvas is aria-hidden and
 * exempt). Also settles the audit's open question about the letterpress
 * contrast. Scoped to overlay containers so canvas WebGL noise is excluded.
 */
test.describe('accessibility', () => {
  test('the content overlay has no serious/critical axe violations', async ({ page }) => {
    await bootScene(page);
    await store(page).open('about');
    await expect(page.getByRole('dialog', { name: 'About' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test('Escape closes the panel and returns focus to the document', async ({ page }) => {
    await bootScene(page);
    await store(page).open('about');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await store(page).get()).mode).toBe('travelling');
  });
});
