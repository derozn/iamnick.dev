import { defineConfig, s } from 'velite';

// Blog content pipeline (ADR-0008). The frontmatter schema is the contract:
// invalid frontmatter fails `velite build`, and therefore `pnpm validate` and
// the production build — never renders wrong.
export default defineConfig({
  collections: {
    posts: {
      name: 'Post',
      pattern: 'blog/**/*.mdx',
      schema: s
        .object({
          title: s.string().min(3).max(99),
          // Hard cap keeps descriptions usable as meta descriptions (Stage 4).
          description: s.string().min(10).max(160),
          date: s.isodate(),
          updated: s.isodate().optional(),
          tags: s.array(s.string()).default([]),
          draft: s.boolean().default(false),
          slug: s.slug('blog'),
          metadata: s.metadata(),
          excerpt: s.excerpt(),
          code: s.mdx(),
        })
        .transform((data) => ({ ...data, permalink: `/blog/${data.slug}` })),
    },
  },
});
