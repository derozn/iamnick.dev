import { expect, test } from '@playwright/test';

/**
 * Blog surface (Stage 2 gate — docs/redesign/blog-handoff.md §6). Plain DOM,
 * no canvas: safe for the @ci subset. Seed content: two published Posts and
 * one Draft (designing-the-publish-pipeline).
 */
test.describe('blog', { tag: '@ci' }, () => {
  test('index lists published Posts, newest first', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('measured twice');
    const titles = page.getByRole('heading', { level: 2 });
    await expect(titles.first()).toContainText('Building this blog in the open');
    await expect(titles).toContainText(['Building this blog in the open']);
  });

  test('index never lists a Draft', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByText('Designing the publish pipeline')).toHaveCount(0);
  });

  test('a Post renders with highlighted code and reading time', async ({ page }) => {
    await page.goto('/blog/building-this-blog-in-the-open');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Building this blog in the open',
    );
    await expect(page.getByText(/\d+ min/)).toBeVisible();
    // Build-time Shiki: the code block arrives pre-tokenised, no client JS.
    const shiki = page.locator('pre.shiki');
    await expect(shiki).toHaveCount(1);
    expect(await shiki.locator('span[style*="color"]').count()).toBeGreaterThan(3);
  });

  test.skip('prev/next links older and newer Posts', async ({ page }) => {
    await page.goto('/blog/building-this-blog-in-the-open');
    const older = page.getByRole('link', { name: /older/ });
    await expect(older).toContainText('Speccing before scaffolding');
    await older.click();
    await expect(page).toHaveURL(/speccing-before-scaffolding/);
    await expect(page.getByRole('link', { name: /newer/ })).toContainText(
      'Building this blog in the open',
    );
  });

  test('a Draft slug is a 404', async ({ page }) => {
    const res = await page.goto('/blog/designing-the-publish-pipeline');
    expect(res?.status()).toBe(404);
  });

  test('blog pages mount no canvas and no carnival chrome', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('canvas')).toHaveCount(0);
    // The carnival SiteNav stands down on brand surfaces (ADR-0011).
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveCount(0);
  });
});
