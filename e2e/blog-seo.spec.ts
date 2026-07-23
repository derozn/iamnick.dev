import { expect, test } from '@playwright/test';

const ORIGIN = 'http://localhost:3000';
const SITE = 'https://iamnick.dev';

/** Fixed to the seed content: one published Post, two Drafts. If the seed set
 *  changes these move, but the Draft-never-leaks contract does not. */
const PUBLISHED_SLUG = 'building-this-blog-in-the-open';
const DRAFT_SLUGS = ['designing-the-publish-pipeline', 'speccing-before-scaffolding'];

/** All application/ld+json blocks on a page, parsed. */
function extractJsonLd(html: string): unknown[] {
  const blocks = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs),
  ];
  return blocks.map((match) => JSON.parse(match[1]));
}

test.describe('blog SEO surfaces', { tag: '@ci' }, () => {
  test('sitemap lists published Posts and never a Draft', async ({ request }) => {
    const res = await request.get(`${ORIGIN}/sitemap.xml`);
    expect(res.status()).toBe(200);
    const xml = await res.text();

    expect(xml).toContain(`${SITE}/blog/${PUBLISHED_SLUG}`);
    for (const slug of DRAFT_SLUGS) {
      expect(xml).not.toContain(`/blog/${slug}`);
    }
  });

  test('RSS is well-formed, published-only, and served as RSS', async ({ request }) => {
    const res = await request.get(`${ORIGIN}/blog/rss.xml`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/rss+xml');

    const xml = await res.text();
    // Well-formed enough to parse in a browser DOMParser without a parsererror.
    expect(xml.startsWith('<?xml')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('</rss>');

    expect(xml).toContain(`/blog/${PUBLISHED_SLUG}`);
    for (const slug of DRAFT_SLUGS) {
      expect(xml).not.toContain(`/blog/${slug}`);
    }
  });

  test('RSS parses as a DOM document with no parser error', async ({ page }) => {
    const res = await page.request.get(`${ORIGIN}/blog/rss.xml`);
    const xml = await res.text();
    const itemCount = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, 'application/xml');
      if (doc.querySelector('parsererror')) return -1;
      return doc.querySelectorAll('item').length;
    }, xml);
    expect(itemCount).toBeGreaterThan(0);
  });

  test('a Post carries valid BlogPosting JSON-LD', async ({ request }) => {
    const res = await request.get(`${ORIGIN}/blog/${PUBLISHED_SLUG}`);
    expect(res.status()).toBe(200);
    const html = await res.text();

    const graphs = extractJsonLd(html) as Array<{
      '@type'?: string;
      headline?: string;
      author?: unknown;
    }>;
    const posting = graphs.find((g) => g['@type'] === 'BlogPosting');
    expect(posting, 'BlogPosting JSON-LD present').toBeTruthy();
    expect(posting?.headline).toBeTruthy();
    expect(posting?.author).toBeTruthy();
  });

  test('a Post exposes a canonical URL', async ({ request }) => {
    const res = await request.get(`${ORIGIN}/blog/${PUBLISHED_SLUG}`);
    const html = await res.text();
    expect(html).toContain(`href="https://iamnick.dev/blog/${PUBLISHED_SLUG}"`);
  });

  test('the per-Post OG route returns an image', async ({ request }) => {
    const res = await request.get(`${ORIGIN}/blog/${PUBLISHED_SLUG}/opengraph-image`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/');
  });
});
