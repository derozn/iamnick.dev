import { expect, test } from '@playwright/test';

import { bootScene, store } from './helpers';

test.describe('Madame Zara (stub mode)', () => {
  test('streams a reading with a drawn-card heading', async ({ page }) => {
    await bootScene(page);
    // Open the fortune wagon's panel directly via the store.
    await store(page).open('fortune');

    const input = page.getByLabel(/Ask Madame Zara/i);
    await expect(input).toBeVisible();
    await input.fill('What does Nick do?');
    await input.press('Enter');

    // The canned stub reading streams into the readings log with a card heading
    // (first line) followed by the body.
    const log = page.getByRole('log', { name: 'Readings' });
    await expect(log.getByText('The Lantern', { exact: true })).toBeVisible();
    await expect(log.getByText(/lead engineer at Travelex/i)).toBeVisible();
  });
});
