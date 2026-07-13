import { expect, test } from '@playwright/test';

import { bootScene, store } from './helpers';

test.describe('content journeys', () => {
  test('the quick-view drawer opens each section panel in place', async ({ page }) => {
    await bootScene(page);
    const s = store(page);

    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('button', { name: /About/ }).click();

    // The content overlay rises for the chosen attraction.
    await expect(page.getByRole('dialog', { name: 'About' })).toBeVisible();
    expect((await s.get()).mode).toBe('viewing');

    // Close and quick-view Career — its ticket deck carries a real CV fact.
    await page.getByRole('button', { name: 'Close panel' }).click();
    await expect.poll(async () => (await s.get()).mode).toBe('travelling');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('button', { name: /Career/ }).click();
    // Scope to the career dialog — the sr-only StaticCv also contains "Travelex".
    const career = page.getByRole('dialog', { name: 'Career' });
    await expect(career.getByRole('heading', { name: 'Travelex', exact: true })).toBeVisible();
  });
});
