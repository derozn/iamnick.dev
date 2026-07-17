# 0008 — Blog content pipeline: typed MDX layer via Velite

Status: accepted (2026-07-16)

Blog posts are MDX files in `content/blog/` (per ADR-0002) compiled at build time through **Velite**: a Zod-extended schema validates every post's frontmatter, generates TypeScript types, and derives reading time, word count and excerpts. A single typed accessor module (mirroring the `src/content/cv.ts` pattern) is the only way application code reads posts; a `publishedPosts` accessor is the single point that excludes drafts from routes, tags, sitemap, RSS and static params.

## Why

The repo's content ethos is typed data with tests beside it (`src/content/cv.ts`). Hand-parsed frontmatter reintroduces the class of errors the CV layer was built to prevent: a typo in a date or a missing description should fail `pnpm validate`, not render wrong in production. Velite's schema is Zod-based (Zod is already a dependency), and its built-ins — `s.metadata()` for reading time/word count, `s.slug()` with per-collection uniqueness, `s.excerpt()` — cover the v1 scope with near-zero custom code. Verified against current Velite docs on 2026-07-16.

## Considered options

- **Content Collections** (`@content-collections/*`) — close runner-up: same Zod-schema model and tighter Next plugin integration (`withContentCollections`), but reading time, excerpts and slug uniqueness are all hand-rolled in `transform`. More code for the same result.
- **`@next/mdx`** — rejected: MDX files become page modules, which fights a `content/` directory with frontmatter-driven routing and gives no schema validation at all.
- **`next-mdx-remote` + `gray-matter`, hand-rolled** — rejected as the first choice (typing and validation are all manual), but **retained as the recorded fallback**: if Velite stalls or blocks a Next upgrade, the content files and frontmatter schema survive unchanged and only the loader is rewritten.

## Consequences

- The frontmatter schema (`title`, `description`, `date`, `updated`, `tags`, `draft`, slug) is the contract; invalid frontmatter fails the build. Schema tests live beside the accessor, Vitest-style.
- Velite runs as a build/watch step producing a generated output directory; knip and ESLint configs need to be taught about it.
- Velite's MDX rendering evaluates the compiled component function at render time (`new Function`), the standard compiled-MDX pattern; noted for any future CSP hardening.
- Shiki-class syntax highlighting and any remark/rehype plugins hang off this pipeline at build time — no client-side highlighter or MDX runtime ships to the browser.
- Draft leakage is structurally prevented: everything public reads `publishedPosts`, and an `@ci` E2E asserts a known draft slug 404s and is absent from RSS and sitemap.
