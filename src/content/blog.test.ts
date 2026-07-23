import { describe, expect, it } from 'vitest';

import { allPosts, postsForTag, publishedPosts, publishedTags, routablePosts } from './blog';

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

describe('content/blog tags', () => {
  it('lists only Tags carried by a published Post, unique and alphabetical', () => {
    const publishedTagSet = new Set(publishedPosts.flatMap((post) => post.tags));
    expect(new Set(publishedTags).size).toBe(publishedTags.length);
    expect([...publishedTags].sort((a, b) => a.localeCompare(b))).toEqual([...publishedTags]);
    for (const tag of publishedTags) expect(publishedTagSet.has(tag)).toBe(true);
  });

  it('never surfaces a Tag that only a Draft carries', () => {
    const publishedTagSet = new Set(publishedPosts.flatMap((post) => post.tags));
    const draftOnly = new Set(allPosts.filter((post) => post.draft).flatMap((post) => post.tags));
    for (const tag of draftOnly) {
      if (!publishedTagSet.has(tag)) expect(publishedTags).not.toContain(tag);
    }
  });

  it('postsForTag returns published Posts carrying the Tag, and nothing for an unknown Tag', () => {
    for (const tag of publishedTags) {
      const forTag = postsForTag(tag);
      expect(forTag.length, tag).toBeGreaterThan(0);
      expect(
        forTag.every((post) => !post.draft && post.tags.includes(tag)),
        tag,
      ).toBe(true);
    }
    expect(postsForTag('definitely-not-a-tag')).toHaveLength(0);
  });
});

describe('content/blog Draft preview (routablePosts)', () => {
  it('always routes every published Post', () => {
    for (const post of publishedPosts) {
      expect(routablePosts.map((p) => p.slug)).toContain(post.slug);
    }
  });

  it('routes Drafts outside production while publishedPosts still hides them', () => {
    // vitest runs with NODE_ENV=test, so the dev-preview branch is active. This
    // pins the contract: a Draft is reachable at its URL locally, yet never
    // appears in publishedPosts (the read behind index, tags, sitemap and feeds).
    for (const draft of allPosts.filter((post) => post.draft)) {
      expect(routablePosts.map((p) => p.slug)).toContain(draft.slug);
      expect(publishedPosts.map((p) => p.slug)).not.toContain(draft.slug);
    }
  });
});
