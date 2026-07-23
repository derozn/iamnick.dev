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

/** True in `next dev`; false in every production build (Vercel preview deploys
 *  build with NODE_ENV=production too). Gates Draft preview and nothing else. */
const previewingDrafts = process.env.NODE_ENV !== 'production';

/**
 * Posts whose `/blog/[slug]` route exists. Production is exactly publishedPosts;
 * `next dev` also routes Drafts so the author can preview one at its URL. Read
 * this ONLY for the Post route's params and lookup. The index, tag pages, sitemap
 * and feeds stay on publishedPosts, so a Draft never leaks (handoff §4).
 */
export const routablePosts: readonly Post[] = previewingDrafts
  ? [...posts].sort((a, b) => b.date.localeCompare(a.date))
  : publishedPosts;

/** Every Tag on a published Post, unique and alphabetical. A Draft-only Tag never appears. */
export const publishedTags: readonly string[] = [
  ...new Set(publishedPosts.flatMap((post) => post.tags)),
].sort((a, b) => a.localeCompare(b));

/** Published Posts carrying a Tag, newest-first (publishedPosts is already sorted). */
export const postsForTag = (tag: string): readonly Post[] =>
  publishedPosts.filter((post) => post.tags.includes(tag));
