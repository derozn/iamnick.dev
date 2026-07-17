# Blog — Build Handoff

> **Mission for the next session:** build **Stage 4 — SEO surfaces**: `generateMetadata` for the
> index and Posts, per-post OG image, `BlogPosting` JSON-LD, sitemap extension, RSS — every surface
> reading `publishedPosts` (`src/content/blog.ts`) and nothing else. Gates: `pnpm validate` plus
> `@ci` contract assertions in the `api.spec.ts` style (RSS valid XML excluding Drafts, sitemap
> contains Post URLs, JSON-LD parses, OG route returns an image).
>
> Stage 2 is built and gated green but its merge waits on two human gates — see **Needs Nick** (§9).
>
> Specs are done and live in `docs/blog/` — this doc points at them and adds only build-facing
> operational detail. Read `CONTEXT.md` first (Blog/Post/Tag/Draft entries). Each stage gets its
> own branch, PR to master — the site is live, every slice must leave production shippable.

---

## 0. TL;DR of what to do

1. Read the spec set: `docs/blog/discovery.md` (decision log, rows 1–19), `docs/blog/prd.md` (what
   launch must include), `docs/blog/agentic-workflow.md` (how each stage runs and gates). ADRs
   0008–0011 are all **accepted** and binding.
2. Stage order: **0 ✅ → B ✅ → 1 ✅ → 2 ✅ → 4 → 5** (Stage 3 deleted, ADR-0011; numbering preserved).
3. Every stage is bracketed by carnival-context **Brief** before and **Absorb** after; Absorb also
   appends a dated paragraph to `docs/blog/journal.md`.
4. Stage 4 next (see §8). Do not duplicate spec content into code comments or this doc — the specs
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
- **Seed Posts** in `content/blog/`: `building-this-blog-in-the-open.mdx` (published, carries a
  code block as the highlighting test), `designing-the-publish-pipeline.mdx` (Draft) and
  `speccing-before-scaffolding.mdx` (published, added at Stage 2 — prev/next needs two published
  Posts; a recorded deviation from the two-seed plan). Every later stage tests against real
  content.
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
- **Branch state**: Stage 2 work sits **uncommitted** on `feature/blog-stage-2` — no commits
  beyond master, no PR opened yet. Master is green (the PR #72 prettier red was fixed by the
  PR #73 merge).

## 2. Integration map

```
content/blog/*.mdx  ──Velite (build/watch)──►  generated typed output
                                                    │
                                        typed accessor module (Stage 1)
                                        publishedPosts = the ONLY public read
                                                    │
              ┌─────────────────────────────────────┼──────────────────────────┐
        /blog + /blog/[slug]                  /blog/tags/[tag]           SEO surfaces
        (Stage 2 ✅ — brand tokens          (Stage 5)                (Stage 4: metadata,
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
- **Brand monogram small-size pass done, ruling pending** — three variants rendered in
  `docs/brand/boards/monogram-pass.{html,png}`: V1 (heavier stems, dash kept), V2 (points, no
  dash — cleanest at 16px), V3 (measured cut — boldest at large, muddy ≤32px). Nick rules the
  result (`docs/brand/brand.md` §Open refinements); blocks the Stage 2 merge.
- **"Career tickets" glossary gap** — glossary-guard advisory from the Stage 0 review; a
  carnival-side term, not blog work. Parked; do not fix under a blog branch.

## 8. Build order

1. ~~**Stage 1 — content pipeline + typed layer**~~ ✅ done (2026-07-17, `feature/blog-stage-1`,
   gate `pnpm validate` green, 162 tests) — see §1.
2. ~~**Stage 2 — routes + reading template**~~ ✅ built and gated (2026-07-17,
   `feature/blog-stage-2` — `pnpm validate` green, blog e2e 6/6). **Merge blocked on the two
   human gates** (reading feel, monogram ruling — §9 Needs Nick); PR not yet opened.
3. **Stage 4 — SEO surfaces** (next): `generateMetadata`, per-post OG image, `BlogPosting` JSON-LD,
   sitemap extension, RSS.
4. **Stage 5 — tag pages + Draft polish**; docs-scribe close-out; this doc gains a shipped-state
   summary (the `ball-toss-game-built.md` pattern).

Every stage: carnival-context Brief before, Absorb after, journal paragraph appended to
`docs/blog/journal.md`. Branch per stage, PR to master.

## 9. What just happened

**Stage 2 built and gated** (2026-07-17, `feature/blog-stage-2` — work uncommitted on the branch,
PR not yet opened; `pnpm validate` fully green, blog e2e 6/6). The routes and reading template
landed on the Blueprint brand: the full brand token block in `@theme` (transferred almost
verbatim from the board's CSS — the board _was_ CSS), `.brand-surface`/`.brand-prose`/
`brand-underline`, IBM Plex via `next/font` scoped to the blog layout, the three routes, the
Velite function-body renderer, build-time Shiki, and SiteNav standing down on `/blog` while
gaining the Blog link. A third seed Post was added so prev/next had two published Posts to
navigate between — a recorded deviation from the two-seed plan. Findings folded into §7: the
`react-hooks/static-components` documented exception, knip catching the redundant `shiki`
package, and the hand-measured first-load JS baseline (Next 16 dropped per-route sizes), which
surfaced that blog pages inherit the carnival's ~1.01 MB root-layout client bundle. Before that,
Stage 1 (`feature/blog-stage-1`, PR #73) landed the content pipeline and typed layer.

### Needs Nick

Both block the Stage 2 **merge**, not the PR opening:

- **Reading-feel sign-off** — Nick reads `/blog` and a Post on the PR preview URL (the viewing
  surface) and rules the feel: type scale, measure, blueprint-grid shell, code blocks.
- **Monogram ruling** — pick V1 / V2 / V3 from `docs/brand/boards/monogram-pass.{html,png}`
  (V2 is cleanest at 16px; V3 muddies at ≤32px). Result recorded in `docs/brand/brand.md`.
