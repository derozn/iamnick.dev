# Blog — As-Built

> **Status: built and shipped.** The blog is complete end-to-end across Stages 0, B, 1, 2, 4, 5
> (Stage 3 was deleted under ADR-0011). This is the at-a-glance "what the blog IS now" doc: the
> routes, the content pipeline, the SEO surfaces, the Draft and Tag model, and the single-read
> contract that ties them together. Read this first; `docs/redesign/blog-handoff.md` behind it holds
> the full build history, the stage-by-stage detail, and the gotchas.
>
> The one thing left is the **authoring pipeline** (`/publish-post` skill + `post-reviewer` agent).
> That is how Posts get written and reviewed, a separate workstream, not a build stage. See §6.

---

## 0. TL;DR

- A brand-styled build journal at **`/blog`** on the iamnick **Blueprint** brand (slate/fog, redline
  accent, IBM Plex), self-contained from the carnival (ADR-0011). Index, Post reading template, tag
  pages, and a dev-only Draft preview, plus the full SEO/discovery/social set.
- **Content is MDX in the repo** (`content/blog/*.mdx`), compiled at build time by **Velite** into a
  typed layer. No client-side MDX runtime, no client-side highlighter.
- **One public read governs everything.** `publishedPosts` in `src/content/blog.ts` is the single
  Draft-filtered source; the index, tag pages, sitemap and feeds all derive from it, so a Draft
  cannot leak by construction.
- Live seed content: **one published Post** (`building-this-blog-in-the-open`, Tags
  `agentic-workflows` + `meta`) and **two Drafts** (`designing-the-publish-pipeline`,
  `speccing-before-scaffolding`). Published Tags are `agentic-workflows` and `meta`.
- Gate is `pnpm validate` (167 unit tests, knip clean, production build) plus the `@ci` Playwright
  specs `e2e/blog.spec.ts` and `e2e/blog-seo.spec.ts`.

---

## 1. Routes (what exists)

```
src/app/blog/
  layout.tsx              — brand shell + header (iam|nick|.dev treatment, blog breadcrumb).
                            Loads the brand fonts; SiteNav stands down on /blog (ADR-0011).
  page.tsx                — index. "Notes, measured twice." with the dimension underline;
                            fig.-numbered Post list over publishedPosts. Static metadata
                            (canonical /blog, RSS autodiscovery, OpenGraph website).
  [slug]/page.tsx         — Post reading template. generateStaticParams over routablePosts,
                            dynamicParams = false. brand-prose article via MdxContent; fig.
                            meta row (Tags link out, middot separators); older/newer nav;
                            BlogPosting JSON-LD (omitted for a previewed Draft).
  [slug]/opengraph-image.tsx — per-Post OG card, Blueprint palette, real brand fonts vendored
                            as woff (Satori reads neither Tailwind nor @theme). SSG per
                            published Post; a Draft slug gets no card.
  tags/[tag]/page.tsx     — tag page. Kicker + #tag with the dimension underline, fig-less Post
                            list. generateStaticParams over publishedTags, dynamicParams = false,
                            so an unknown or Draft-only Tag 404s. generateMetadata: canonical +
                            OpenGraph per Tag.
  rss.xml/route.ts        — hand-rolled RSS 2.0 (dynamic = 'force-static', published only,
                            XML-escaped). No feed dependency.

src/app/sitemap.ts        — /blog, each published Post (lastModified from updated ?? date), and
                            each published Tag URL (/blog/tags/[tag]).

src/components/blog/
  MdxContent.tsx          — Velite compiled-function-body renderer (the documented react-hooks
                            inline disable lives here; it is compiled-MDX's core mechanism).
  BlogPostingJsonLd.tsx   — BlogPosting JSON-LD (mirrors the CV JsonLd Person pattern; author +
                            publisher = Nick; image → the co-located OG route; keywords from Tags).
```

Brand styling lives in `src/styles/globals.css`: the `@theme` block carries the brand-prefixed
Utopia type/space tokens (320→1240px, body 18→21px, ratio 1.2→1.25), `.brand-surface`,
`.brand-prose` (including the Shiki `pre` overrides), and the `brand-underline` utility. Brand fonts
(IBM Plex Sans/Mono via `next/font`) are in `src/lib/fonts/brand.ts`, loaded only by the blog
layout. `docs/brand/brand.md` is the visual source of truth.

---

## 2. Content pipeline

```
content/blog/*.mdx  ──Velite (build + dev watch)──►  generated typed output (#velite alias)
                                                            │
                                              src/content/blog.ts (typed accessors)
```

- **Velite** (`velite.config.ts`) reads `content/blog/**/*.mdx`, validates a Zod frontmatter
  contract (`title` 3–99, `description` 10–160, isodate `date`/`updated`, `tags` default `[]`,
  `draft` default `false`, unique `slug`, derived reading time + excerpt + compiled MDX,
  `permalink` → `/blog/{slug}`). **Invalid frontmatter fails the build** (`pnpm content`, therefore
  `pnpm validate` and the production build).
- **Shiki at build time** (`@shikijs/rehype`, `github-dark-default`) in the Velite MDX options. No
  client-side highlighter ships; the standalone `shiki` package is not a dependency.
- Toolchain: `#velite` path alias; `.velite/` ignored in git/prettier/eslint/knip; scripts `content`
  (`velite build`) and `build` (`velite build && next build`); `validate` prepends `pnpm content`;
  `next.config.ts` starts the Velite watch in dev only.

---

## 3. The Draft and Tag model: the single-read contract

`src/content/blog.ts` is the whole model. Everything public derives from **`publishedPosts`**:

| Accessor           | Reads            | Purpose                                                                                           |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------- |
| `allPosts`         | Velite output    | Dev/tests only. Never a public read.                                                              |
| `publishedPosts`   | `allPosts`       | **The** public read: Draft-filtered, newest-first. Index, tag pages, sitemap, RSS, OG all use it. |
| `routablePosts`    | `publishedPosts` | The Post route's param source only. `publishedPosts` in production; `+ Drafts` in `next dev`.     |
| `publishedTags`    | `publishedPosts` | Unique, alphabetical Tags on published Posts. Drives tag-page params + sitemap.                   |
| `postsForTag(tag)` | `publishedPosts` | Published Posts carrying a Tag, newest-first.                                                     |

- **Draft exclusion by construction.** Because `publishedTags` and `postsForTag` read
  `publishedPosts`, a Draft-only Tag (`process`, carried only by the `speccing-before-scaffolding`
  Draft) never gets a page or a sitemap entry.
- **Draft preview is dev-only.** `routablePosts` gates on `process.env.NODE_ENV !== 'production'`. In
  `next dev` a Draft is reachable at its URL with a "Draft. Visible only in local development, never
  in production." banner and no JSON-LD. Production **and Vercel preview** builds run
  `NODE_ENV=production`, so they exclude Drafts too. The preview is a local affordance, not a staging
  one. Only the Post route reads `routablePosts`; everything else stays on `publishedPosts`.
- **Tags link from the Post, not the index.** The Post meta row links each Tag to `/blog/tags/[tag]`.
  The index leaves Tags as text because the whole Post row is already a link and a link cannot nest.

Live seed reality: `building-this-blog-in-the-open.mdx` published (Tags `agentic-workflows` +
`meta`); `designing-the-publish-pipeline.mdx` Draft (Tag `agentic-workflows`);
`speccing-before-scaffolding.mdx` Draft (Tags `agentic-workflows` + `process`). Published Tags:
`agentic-workflows`, `meta`.

---

## 4. SEO, discovery and social surfaces

All read `publishedPosts` and nothing else, so a Draft cannot enter a feed, sitemap or card.

- **Metadata** — static on the index (canonical, RSS autodiscovery, OpenGraph website);
  `generateMetadata` on each Post from frontmatter (canonical, OpenGraph article with
  published/modified time, authors, Tags, Twitter `summary_large_image`); `generateMetadata` on each
  tag page (canonical + OpenGraph).
- **OG cards** — per-Post at `[slug]/opengraph-image.tsx`, Blueprint palette, real brand fonts
  vendored to `src/assets/fonts/ibm-plex-*.woff`, all-inline styling. SSG per published Post.
- **JSON-LD** — `BlogPosting` per Post (omitted for a previewed Draft).
- **Sitemap** — `/blog`, each published Post, each published Tag URL.
- **RSS** — hand-rolled RSS 2.0 at `/blog/rss.xml`, published only.

---

## 5. Where the specs, decisions and history live

- **Build handoff (full history + gotchas):** `docs/redesign/blog-handoff.md`.
- **Build journal (one dated paragraph per stage):** `docs/blog/journal.md`.
- **What launch must include:** `docs/blog/prd.md`.
- **How each stage ran + the authoring pipeline spec:** `docs/blog/agentic-workflow.md`.
- **Decision log:** `docs/blog/discovery.md` (rows 1–19).
- **ADRs (all accepted):** 0008 (Velite typed MDX), 0009 (Utopia fluid type/space, brand-scoped),
  0010 (agentic delivery workflow + two-component hard cap), 0011 (brand separation).
- **Look:** `docs/brand/brand.md`, `docs/brand/boards/concept-c-blueprint.html`.
- **Glossary:** `CONTEXT.md` (Blog, Post, Tag, Draft, in plain English, no carnival register).

---

## 6. What remains: the authoring pipeline (separate workstream)

The blog **surface** is built. What is not built is how Posts get written and reviewed, specified in
ADR-0010 and `docs/blog/agentic-workflow.md`:

- **`/publish-post` skill** — scaffold a Post from an idea, enforce the frontmatter contract, warn on
  a new Tag (the vocabulary is kept deliberately small).
- **`post-reviewer` agent** — a voice + `avoid-ai-writing` pass on a draft Post before Nick merges.

These are the **only two** `.claude` components the blog is allowed (ADR-0010's two-component hard
cap). Publishing stays Nick's act: Nick drafts, AI edits, publishing is Nick flipping `draft: false`
and merging the PR. This work is Nick's to kick off, and it runs as its own workstream, not as
another blog build stage.

---

## 7. Quick orientation for a fresh session

1. Read this doc, then `docs/redesign/blog-handoff.md` §7 (gotchas) if you are touching the build.
2. `src/content/blog.ts` is the whole Draft/Tag model; start there.
3. `pnpm dev`, open `/blog`, `/blog/[slug]`, `/blog/tags/agentic-workflows`, and a Draft URL (banner
   in dev, 404 in a production build).
4. Gate any change with `pnpm validate` + the `@ci` specs `e2e/blog.spec.ts`, `e2e/blog-seo.spec.ts`.
