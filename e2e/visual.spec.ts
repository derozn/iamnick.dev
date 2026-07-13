import { expect, test } from '@playwright/test';

import { bootScene, store } from './helpers';

/**
 * Visual checks, split by surface (agreed in the grilling session; see
 * docs/refactor-plan.md Phase 6):
 *  - DOM overlays: captured as a REVIEW ARTIFACT (attached to the report), not a
 *    gated pixel-diff. The panel sits over the continuously-repainting canvas,
 *    which defeats Playwright's element-stability wait — so per the plan's
 *    "artifact screenshots first, pixel-diff once stable" staging this is an
 *    artifact for now; a gated diff (with committed CI baselines) is a follow-on.
 *  - Canvas: colour is unreliable under SwiftShader → NO pixel-diff. Instead,
 *    programmatic sanity: it draws a non-trivial frame, and distinct POIs differ.
 */
test.describe('visual — DOM overlays (review artifact)', () => {
  test('captures the content overlay', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
    await bootScene(page);
    await store(page).open('about');
    const dialog = page.getByRole('dialog', { name: 'About' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(700); // let the entrance settle

    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    // page.screenshot({ clip }) skips element-stability actionability (which the
    // live canvas behind never satisfies) — fine for an attached artifact.
    const shot = await page.screenshot({ clip: box! });
    await testInfo.attach('about-panel', { body: shot, contentType: 'image/png' });
    expect(shot.byteLength).toBeGreaterThan(5_000);
  });
});

test.describe('visual — canvas (programmatic, no pixel-diff)', () => {
  test('draws a non-trivial frame and distinct POIs differ', async ({ page }) => {
    await bootScene(page);
    const canvas = page.locator('canvas');

    // A rendered carnival compresses to a chunky PNG; a black/empty frame is tiny.
    const overview = await canvas.screenshot();
    expect(overview.byteLength).toBeGreaterThan(20_000);

    // Flying to an attraction changes what the camera sees → a different frame.
    await store(page).focus('ball-toss');
    await page.waitForTimeout(2500); // let the fly-in ease settle
    const focused = await canvas.screenshot();
    expect(focused.equals(overview)).toBe(false);
  });
});
