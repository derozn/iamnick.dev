import { posts } from '#velite';

export type Post = (typeof posts)[number];

/**
 * All Posts including Drafts — dev-only surfaces (Draft preview, Stage 5) and
 * tests may read this; nothing public ever should.
 */
export const allPosts: readonly Post[] = posts;

/**
 * The only public read of the blog content layer (docs/redesign/blog-handoff.md §4):
 * static params, the index, tag pages, sitemap and RSS all consume this list.
 * Draft exclusion lives here and nowhere else.
 */
export const publishedPosts: readonly Post[] = [...posts]
  .filter((post) => !post.draft)
  .sort((a, b) => b.date.localeCompare(a.date));
