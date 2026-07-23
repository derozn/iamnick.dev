# Blog — Build Handoff

> **Mission for the next session:** build **Stage 5 — Tag pages + Draft polish**. Tag routes
> (`/blog/tags/[tag]`) over `publishedPosts`, the draft-preview mechanism (deferred from Stage 2),
> then the sitemap tag URLs that Stage 4 held back until tag pages existed. Docs-scribe close-out:
> this doc gains a shipped-state summary in the `ball-toss-game-built.md` pattern.
>
> Stage 4 (SEO surfaces) landed and merged. Stage 2 merged as PR #74, so its two human gates are
> moot.
>
> Specs are done and live in `docs/blog/`; this doc points at them and adds only build-facing
> operational detail. Read `CONTEXT.md` first (Blog/Post/Tag/Draft entries). Each stage gets its
> own branch and a PR to master. The site is live, so every slice must leave production shippable.

---

## 0. TL;DR of what to do

1. Read the spec set: `docs/blog/discovery.md` (decision log, rows 1–19), `docs/blog/prd.md` (what
   launch must include), `docs/blog/agentic-workflow.md` (how each stage runs and gates). ADRs
   0008–0011 are all **accepted** and binding.
2. Stage order: **0 ✅ → B ✅ → 1 ✅ → 2 ✅ → 4 ✅ → 5** (Stage 3 deleted, ADR-0011; numbering preserved).
3. Every stage is bracketed by carnival-context **Brief** before and **Absorb** after; Absorb also
   appends a dated paragraph to `docs/blog/journal.md`.
4. Stage 5 next (see §8). Do not duplicate spec content into code comments or this doc; the specs
   are the source.

---

## 1. Current state (what exists — do not rebuild)

- **Specs complete** (Stage 0, 2026-07-16): `docs/blog/discovery.md`, `prd.md`,
  `agentic-workflow.md`; ADR-0008 (Velite typed MDX), ADR-0009 (Utopia fluid type/space, brand-scoped),
  ADR-0010 (agentic delivery workflow), ADR-0011 (brand separation) — all accepted.
- **Brand ruled** (Stage B, 2026-07-17): the iamnick brand is **Blueprint** — slate/fog/steel, one
  steel-blue accent, constructed-`n` mark, IBM Plex Sans/Mono. `docs/brand/brand.md` is the source of
  truth (strategy, colour tokens, type, voice); the considered concept boards (whoami, Notebook,
  Blueprint) are rendered HTML + PNG in `docs/brand/boards/` — the Blueprint board's CSS is the token
  source.
- **Glossary**: Blog, Post, Tag, Draft entries are in `CONTEXT.md` (plain English, no
  carnival-register naming — ADR-0011). Reviewed by glossary-guard.
- **Content pipeline live** (Stage 1, 2026-07-17, `feature/blog-stage-1`): velite ^0.4.0
  (devDependency) with `velite.config.ts` — posts collection from `content/blog/**/*.mdx`, Zod
  frontmatter contract (title 3–99, description 10–160 so it stays usable as a meta description,
  isodate `date`/`updated`, tags default `[]`, draft default `false`, `s.slug('blog')` uniqueness,
  `s.metadata()` reading time, `s.excerpt()`, `s.mdx()` compiled output, permalink transform
  `/blog/{slug}`). Invalid frontmatter fails `velite build`, therefore `pnpm validate` and the
  production build.
- **Typed accessor**: `src/content/blog.ts` — `allPosts` (dev/tests only) and `publishedPosts`
  (**the** single public read: Draft-filtered, newest-first), with `src/content/blog.test.ts`
  beside it (6 tests: published non-empty, Draft never leaks, ordering, slug/permalink
  uniqueness + shape, frontmatter contract, derived reading time + compiled MDX).
- **Seed Posts** in `content/blog/`: after the Stage 2 merge only **one** is published,
  `building-this-blog-in-the-open.mdx` (carries a code block as the highlighting test).
  `designing-the-publish-pipeline.mdx` and `speccing-before-scaffolding.mdx` are both Drafts
  (`speccing…` was flipped to Draft in the Stage 2 merge, commit 28ec0e7). Consequence for the
  suite: `blog.spec.ts` prev/next now **skips** because it needs two published Posts, and the Stage
  4 SEO tests pin `building-this-blog-in-the-open` as the published fixture with the other two as
  the Draft-never-leaks fixtures. Restoring a second published Post un-skips prev/next; see §7.
- **Toolchain wired**: `#velite` path alias (tsconfig + vitest); `.velite/` ignored in
  git/prettier/eslint/knip; knip entry `velite.config.ts`; scripts `content` (`velite build`) and
  `build` (`velite build && next build`); `validate` prepends `pnpm content`; CI has a "Build
  content layer (velite)" step; `next.config.ts` starts velite watch in dev only (`VELITE_STARTED`
  guard) — production builds run velite explicitly, no race.
- **ESLint three.js ban landed early** (planned Stage 1-or-2, done at Stage 1): `eslint.config.mjs`
  scopes `no-restricted-imports` over `src/app/blog/**`, `src/components/blog/**`,
  `src/content/blog.ts` with patterns `three`, `three/*`, `@react-three/*`.
- **Brand tokens live** (Stage 2, 2026-07-17, `feature/blog-stage-2`): the `@theme` block in
  `src/styles/globals.css` carries `--color-brand-*`, `--font-brand-*`, `--text-brand-xs…3xl`
  (Utopia clamp, 320→1240px viewport range, body 18→21px, ratio 1.2→1.25) and
  `--spacing-brand-3xs…2xl`; plus `.brand-surface` (the blueprint-grid page shell), `.brand-prose`
  (long-form body, including Shiki `pre` overrides) and `@utility brand-underline` (the dimension
  underline). Carnival px tokens untouched. Brand fonts in `src/lib/fonts/brand.ts` (IBM Plex
  Sans/Mono via `next/font`), loaded only by the blog layout.
- **Routes live** (Stage 2): `src/app/blog/layout.tsx` (brand shell + header — the iam|nick|.dev
  treatment plus blog breadcrumb), `page.tsx` (index: Build journal kicker, "Notes, measured
  twice." h1 with the dimension underline, fig.-numbered Post list) and `[slug]/page.tsx`
  (`generateStaticParams` over `publishedPosts`, `dynamicParams = false` so a Draft slug 404s;
  fig. meta row; `brand-prose` article rendered by `src/components/blog/MdxContent.tsx`, the
  Velite function-body renderer; older/newer nav).
- **Shiki at build time**: `@shikijs/rehype` in `velite.config.ts` mdx options
  (`github-dark-default`); no client-side highlighter. The standalone `shiki` package is not a
  dependency (see §7).
- **SiteNav** (`src/components/nav/SiteNav.tsx`): stands down on `/blog` (`usePathname` guard,
  ADR-0011) and carries the Blog route link as the drawer's final item.
- **SEO surfaces live** (Stage 4, 2026-07-23, `feature/blog-stage-4`): every public metadata,
  discovery and social surface, each reading `publishedPosts` and nothing else. Static `metadata`
  on `src/app/blog/page.tsx` (description, canonical `/blog`, RSS autodiscovery via
  `alternates.types`, OpenGraph `type: website`); `generateMetadata` on `[slug]/page.tsx` from
  frontmatter (canonical, OpenGraph `type: article` with published/modified time, authors, tags,
  Twitter `summary_large_image`, RSS autodiscovery); per-Post OG card at
  `src/app/blog/[slug]/opengraph-image.tsx` (Blueprint palette, `generateStaticParams` over
  `publishedPosts` + `dynamicParams = false`, so it is SSG per published Post and a Draft slug gets
  no card); `BlogPosting` JSON-LD at `src/components/blog/BlogPostingJsonLd.tsx` (mirrors the CV
  `JsonLd` Person pattern, author + publisher = Nick, `image` points at the co-located OG route,
  `keywords` from tags); `src/app/sitemap.ts` extended with `/blog` and each published Post
  (`lastModified` from `updated ?? date`); hand-rolled RSS 2.0 at `src/app/blog/rss.xml/route.ts`
  (`dynamic = 'force-static'`, published only, XML-escaped, `application/rss+xml`, no new
  dependency). Gates green: `pnpm content` + `pnpm typecheck` + `pnpm lint` + `pnpm test:ci` (162
  unit) + `pnpm knip` + `pnpm build`, plus the new `@ci` spec `e2e/blog-seo.spec.ts` 6/6.
- **Branch state**: Stage 2 merged to master as **PR #74**; Stage 1 was PR #73, Stage 0 PR #72.
  Master is green. Stage 4 sits on `feature/blog-stage-4`.

## 2. Integration map

```
content/blog/*.mdx  ──Velite (build/watch)──►  generated typed output
                                                    │
                                        typed accessor module (Stage 1)
                                        publishedPosts = the ONLY public read
                                                    │
              ┌─────────────────────────────────────┼──────────────────────────┐
        /blog + /blog/[slug]                  /blog/tags/[tag]           SEO surfaces
        (Stage 2 ✅ — brand tokens          (Stage 5)                (Stage 4 ✅: metadata,
         live in @theme)                                              OG, JSON-LD,
                                                                      sitemap, RSS)
```

Touchpoints with the existing tree: `src/styles/globals.css` `@theme` block (brand-prefixed Utopia
tokens landed at Stage 2 — carnival px tokens untouched), `SiteNav.tsx` (Blog link + `/blog`
stand-down, Stage 2), `src/app/sitemap.ts` + `src/app/opengraph-image.tsx` patterns (Stage 4),
`e2e/` `@ci` suite (Stages 2/4/5).

## 3. Design spec (pointer — do not restate)

- **What**: `docs/blog/prd.md` — audience, user stories, acceptance criteria, launch content, out of
  scope.
- **How built**: `docs/blog/agentic-workflow.md` — per-stage produces/mechanism/gate, authoring
  pipeline (`/publish-post`), the two-component hard cap.
- **Decisions + why**: `docs/blog/discovery.md` decision log; ADRs 0008–0011.
- **Look**: `docs/brand/brand.md` + `docs/brand/boards/concept-c-blueprint.html`.

## 4. Integration rules (binding)

- **Brand boundary (ADR-0011, ADR-0009):** the blog is an iamnick-brand surface. It never touches
  the carnival's fixed px tokens or its letterpress/ticket utilities; carnival components never
  reference `--brand-*` tokens. No carnival vocabulary in blog copy or identifiers.
- **No three.js under blog code:** `three` / `@react-three/*` are banned imports for blog routes and
  components. **Enforced** since Stage 1 — the `no-restricted-imports` block in `eslint.config.mjs`
  already covers `src/app/blog/**` and `src/components/blog/**`; new blog directories are caught
  automatically, do not re-add.
- **Single accessor:** everything public (params, index, tags, sitemap, RSS) reads `publishedPosts`.
  Draft exclusion lives nowhere else.
- **Build-time only:** MDX compilation and Shiki-class highlighting happen at build; no client-side
  highlighter or MDX runtime ships.
- **Glossary terms exactly:** Blog, Post, Tag, Draft per `CONTEXT.md`; respect every `_Avoid_` list
  (no "article", "category", "unpublished post").

## 5. Decisions (settled — do not reopen)

Full log with rationale: `docs/blog/discovery.md` rows 1–19. The build-facing ones:

| Decision                                                                               | Source                             |
| -------------------------------------------------------------------------------------- | ---------------------------------- |
| MDX in repo, `content/blog/` at repo root                                              | ADR-0002, ADR-0008 (Nick, decided) |
| Velite pipeline; `next-mdx-remote`+`gray-matter` is the recorded fallback              | ADR-0008                           |
| Frontmatter contract: `title`, `description`, `date`, `updated`, `tags`, `draft`, slug | ADR-0008                           |
| Brand = Blueprint; `docs/brand/brand.md` is law                                        | Nick's ruling, 2026-07-17          |
| Utopia fluid type/space, brand-prefixed, iamnick surfaces only                         | ADR-0009 (rescoped by ADR-0011)    |
| Carnival self-contained; Stage 3 (live-surface Utopia migration) deleted               | ADR-0011 (Nick's correction)       |
| Six-stage delivery, Brief/Absorb bracketing, two new `.claude` components hard cap     | ADR-0010                           |
| Nick drafts, AI edits, publishing is Nick merging the PR                               | ADR-0010 (Nick's word)             |

Settled at Stage 2: Utopia scale parameters (320→1240px, body 18→21px, ratio 1.2→1.25 — in
`@theme`, subject only to Nick's reading-feel gate). Still deferred (do not decide early): draft
preview mechanism → Stage 5 brief; tag vocabulary → emerges from first posts; first-load JS
**budget** → baseline now recorded (§7), the budget number itself remains open.

## 6. How to verify

- **Every stage:** `pnpm validate` (typecheck + lint + `test:ci` + knip + build). Stage 1's real
  teeth are the schema tests — invalid frontmatter must fail the build.
- **Stage 2 onward:** `e2e/blog.spec.ts` tagged `@ci` (index renders, post renders, highlighted code
  block, prev/next, draft slug 404s), plus the verify skill and **Nick reads the feel** (human gate).
- **Stage 4:** `@ci` contract assertions in the `api.spec.ts` style — RSS valid XML excluding
  Drafts, sitemap contains post URLs, JSON-LD parses, OG route returns an image.
- **Stage 5:** extended `@ci` blog spec (tag pages correct; Draft absent from index/RSS/sitemap,
  previewable in dev).
- Blog pages are plain DOM — no headless-canvas screenshot rig needed; standard Playwright suffices.

## 7. Gotchas

- **Velite MDX render = compiled-function evaluation** (`new Function` at render, the standard
  compiled-MDX pattern). Harmless today; noted in ADR-0008 for any future CSP hardening — do not add
  a strict `script-src` without accounting for it. The same pattern trips
  `react-hooks/static-components` (a component constructed at render is compiled-MDX's core
  mechanism, not a mistake) — the fix is the documented inline disable in
  `src/components/blog/MdxContent.tsx`, not a refactor; keep the justification with the disable.
- **pnpm 11 `allowBuilds` blocks esbuild** (velite's transitive dep). `pnpm-workspace.yaml` shipped
  with a literal placeholder line under `allowBuilds` that broke `pnpm exec` entirely until it was
  set to a real value; now `esbuild: true` with a comment. Any new dependency with a build script
  needs its own entry there.
- **`prettier --check .` covers `.html` but lint-staged only formats json/css/md** — the Stage B
  brand-board HTMLs slipped through unformatted and broke master CI on the PR #72 merge. Boards and
  `eslint.config.mjs` reformatted on `feature/blog-stage-1`; consider widening the lint-staged glob
  later so the two can't disagree again.
- **First-load JS baseline (recorded 2026-07-17)** — Next 16 no longer prints per-route sizes, so
  the baseline was measured from the prerendered HTML: `/blog` references one shared script
  bundle, ~1.01 MB uncompressed — the **root-layout client bundle** (SiteNav's motion/zustand
  included even though SiteNav renders null on `/blog`). No three.js in blog output. Growth from
  this baseline is a finding at every later gate, never silent. Improvement candidate (unscoped):
  mount SiteNav below the root layout or lazy-load it so brand surfaces stop paying for carnival
  chrome.
- **knip caught the standalone `shiki` package as unused** — `@shikijs/rehype` carries its own;
  removed at Stage 2, do not re-add out of habit.
- **Next 16 forbids `export const runtime = 'edge'` alongside `generateStaticParams`** on a metadata
  image route (Stage 4). The per-Post OG at `src/app/blog/[slug]/opengraph-image.tsx` therefore
  drops the edge runtime and uses the Node default, which is the platform-preferred default now
  anyway. The root carnival `/opengraph-image` keeps edge because it has no `generateStaticParams`.
  Do not "restore" edge on the per-Post card; it will break the build.
- **Satori can't read next/font's Plex, so the OG card vendors its own woff** (Stage 4) — `next/og`
  renders through Satori, which never loads the app stylesheet, Tailwind, the `@theme` brand tokens,
  or `next/font`'s self-hosted Plex. Fonts must be passed as real binaries to `ImageResponse.fonts`.
  Montserrat (wordmark) already shipped as local woff; IBM Plex Sans 600 + Mono 500 were vendored to
  `src/assets/fonts/ibm-plex-*.woff` for the card. Style it with inline literal values (hex from
  `brand.md`, px widths), never classNames or `ch` units — a `ch`-based title width collapsed the
  wrap to one word per line the first time. Nick ruled all-inline is correct here (2026-07-23); the
  carnival `/opengraph-image` sets the same precedent.
- **Seed content drift, and the tests that pin it** (Stage 4) — with only one published Post,
  `blog.spec.ts` prev/next skips (needs two) and the SEO contract tests hardcode
  `building-this-blog-in-the-open` as the published fixture and the two Drafts as the
  never-leaks fixtures. If Stage 5 changes which seeds are published, both suites move with it. See
  §1.
- **Sitemap tag URLs deliberately deferred to Stage 5** — tag pages do not exist yet, so no sitemap
  entry points at a 404. Stage 5 adds the tag routes first, then their sitemap URLs. `src/app/
sitemap.ts` carries the marker comment where they go.
- **Brand monogram small-size pass done, ruling pending** — three variants rendered in
  `docs/brand/boards/monogram-pass.{html,png}`: V1 (heavier stems, dash kept), V2 (points, no
  dash — cleanest at 16px), V3 (measured cut — boldest at large, muddy ≤32px). Nick rules the
  result (`docs/brand/brand.md` §Open refinements); blocks the Stage 2 merge.
- **"Career tickets" glossary gap** — glossary-guard advisory from the Stage 0 review; a
  carnival-side term, not blog work. Parked; do not fix under a blog branch.

## 8. Build order

1. ~~**Stage 1 — content pipeline + typed layer**~~ ✅ done (2026-07-17, `feature/blog-stage-1`,
   gate `pnpm validate` green, 162 tests) — see §1.
2. ~~**Stage 2 — routes + reading template**~~ ✅ built, gated, and merged as **PR #74**
   (2026-07-17 build, merged by 2026-07-23). The two human gates cleared on merge.
3. ~~**Stage 4 — SEO surfaces**~~ ✅ done (2026-07-23, `feature/blog-stage-4`): `generateMetadata`
   for index + Posts, per-Post OG card, `BlogPosting` JSON-LD, sitemap extension, RSS. Full gate
   green plus `e2e/blog-seo.spec.ts` 6/6. See §1.
4. **Stage 5 — tag pages + Draft polish** (next): `/blog/tags/[tag]` over `publishedPosts`, the
   draft-preview mechanism deferred from Stage 2, then the sitemap tag URLs Stage 4 held back.
   Docs-scribe close-out; this doc gains a shipped-state summary (the `ball-toss-game-built.md`
   pattern).

Every stage: carnival-context Brief before, Absorb after, journal paragraph appended to
`docs/blog/journal.md`. Branch per stage, PR to master.

## 9. What just happened

**Stage 4 built and gated** (2026-07-23, `feature/blog-stage-4`). Every public SEO surface landed
against the single `publishedPosts` read: static index `metadata`, per-Post `generateMetadata` off
frontmatter, a Blueprint-branded per-Post OG card, `BlogPosting` JSON-LD (the CV `JsonLd` Person
pattern mirrored), the sitemap extension, and a hand-rolled RSS 2.0 route with no new dependency.
The OG card holds the ADR-0011 boundary on purpose, so it is the Blueprint palette (slate, steel
margin, redline underline, wordmark with the red `.dev`) rather than the carnival poster. Full gate
green, plus a new `@ci` spec `e2e/blog-seo.spec.ts` 6/6.

Two build seams became gotchas (§7). Next 16 refuses `runtime = 'edge'` on a metadata image route
that also has `generateStaticParams`, so the per-Post card runs the Node default while the root
carnival OG keeps edge. And the seed set had drifted under us: the Stage 2 merge left only one
published Post, so `blog.spec.ts` prev/next skips and the SEO tests pin
`building-this-blog-in-the-open` as the published fixture with the two Drafts as the never-leaks
fixtures. Sitemap tag URLs were held back to Stage 5 so nothing points at a tag 404 before those
pages exist.

Before this, Stage 2 (`feature/blog-stage-2`) merged as **PR #74**, which cleared its two human
gates and made them moot.

### Needs Nick

- **OG card feel** — the per-Post social card shipped in the Blueprint palette without a look
  ruling. When Nick has a moment, check a live card (`/blog/building-this-blog-in-the-open/
opengraph-image`) and say whether the composition holds. Not a blocker; a share preview is not on
  the critical path, but it is a public visual surface and the feel is Nick's call.
- **Nothing else outstanding.** The Stage 2 gates (reading feel, monogram ruling) cleared on the
  PR #74 merge.
