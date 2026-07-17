import { describe, expect, it } from 'vitest';

import { allPosts, publishedPosts } from './blog';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/;

describe('content/blog', () => {
  it('has at least one published Post', () => {
    expect(publishedPosts.length).toBeGreaterThan(0);
  });

  it('never exposes a Draft through publishedPosts', () => {
    expect(publishedPosts.every((post) => !post.draft)).toBe(true);
    for (const post of allPosts.filter((p) => p.draft)) {
      expect(publishedPosts.map((p) => p.slug)).not.toContain(post.slug);
    }
  });

  it('orders published Posts newest-first', () => {
    const dates = publishedPosts.map((post) => post.date);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });

  it('gives every Post a unique slug and a matching permalink', () => {
    const slugs = allPosts.map((post) => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const post of allPosts) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);
      expect(post.permalink).toBe(`/blog/${post.slug}`);
    }
  });

  it('honours the frontmatter contract on every Post', () => {
    for (const post of allPosts) {
      expect(post.title.trim(), `${post.slug} title`).not.toBe('');
      expect(post.description.length, `${post.slug} description`).toBeGreaterThanOrEqual(10);
      expect(post.description.length, `${post.slug} description`).toBeLessThanOrEqual(160);
      expect(post.date, `${post.slug} date`).toMatch(ISO_DATE);
      expect(Array.isArray(post.tags), `${post.slug} tags`).toBe(true);
    }
  });

  it('derives reading time and compiled MDX for every Post', () => {
    for (const post of allPosts) {
      expect(post.metadata.readingTime, `${post.slug} readingTime`).toBeGreaterThan(0);
      expect(post.code.length, `${post.slug} compiled MDX`).toBeGreaterThan(0);
    }
  });
});
