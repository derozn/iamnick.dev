# Blog — Build Handoff

> **Mission for the next session:** build **Stage 2 — routes + reading template**: `/blog` and
> `/blog/[slug]` on the Blueprint brand, brand-prefixed Utopia tokens in `@theme`, Shiki
> highlighting, prev/next, reading time, SiteNav Blog link. All public reads go through
> `publishedPosts` (`src/content/blog.ts`). Gates: `pnpm validate`, the `@ci` blog e2e spec, and
> two human gates — Nick reads the feel, monogram small-size pass.
>
> Specs are done and live in `docs/blog/` — this doc points at them and adds only build-facing
> operational detail. Read `CONTEXT.md` first (Blog/Post/Tag/Draft entries). Each stage gets its
> own branch, PR to master — the site is live, every slice must leave production shippable.

---

## 0. TL;DR of what to do

1. Read the spec set: `docs/blog/discovery.md` (decision log, rows 1–19), `docs/blog/prd.md` (what
   launch must include), `docs/blog/agentic-workflow.md` (how each stage runs and gates). ADRs
   0008–0011 are all **accepted** and binding.
2. Stage order: **0 ✅ → B ✅ → 1 ✅ → 2 → 4 → 5** (Stage 3 deleted, ADR-0011; numbering preserved).
3. Every stage is bracketed by carnival-context **Brief** before and **Absorb** after; Absorb also
   appends a dated paragraph to `docs/blog/journal.md`.
4. Stage 2 next (see §8). Do not duplicate spec content into code comments or this doc — the specs
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
  code block as the Stage 2 highlighting test) and `designing-the-publish-pipeline.mdx` (Draft).
  Every later stage tests against real content.
- **Toolchain wired**: `#velite` path alias (tsconfig + vitest); `.velite/` ignored in
  git/prettier/eslint/knip; knip entry `velite.config.ts`; scripts `content` (`velite build`) and
  `build` (`velite build && next build`); `validate` prepends `pnpm content`; CI has a "Build
  content layer (velite)" step; `next.config.ts` starts velite watch in dev only (`VELITE_STARTED`
  guard) — production builds run velite explicitly, no race.
- **ESLint three.js ban landed early** (planned Stage 1-or-2, done at Stage 1): `eslint.config.mjs`
  scopes `no-restricted-imports` over `src/app/blog/**`, `src/components/blog/**`,
  `src/content/blog.ts` with patterns `three`, `three/*`, `@react-three/*`.
- **No routes yet.** No `/blog` pages, no Blog link in `src/components/nav/SiteNav.tsx`, no brand
  tokens in `@theme` — all Stage 2.
- **Master is red** on the PR #72 merge (prettier — see §7); the fix is on `feature/blog-stage-1`
  and merging this branch restores green.

## 2. Integration map

```
content/blog/*.mdx  ──Velite (build/watch)──►  generated typed output
                                                    │
                                        typed accessor module (Stage 1)
                                        publishedPosts = the ONLY public read
                                                    │
              ┌─────────────────────────────────────┼──────────────────────────┐
        /blog + /blog/[slug]                  /blog/tags/[tag]           SEO surfaces
        (Stage 2, brand tokens              (Stage 5)                (Stage 4: metadata,
         land in @theme here)                                         OG, JSON-LD,
                                                                      sitemap, RSS)
```

Touchpoints with the existing tree: `src/styles/globals.css` `@theme` block (brand-prefixed Utopia
tokens added at Stage 2 — carnival px tokens at lines ~94–108 untouched), `SiteNav.tsx` (Blog link,
Stage 2), `src/app/sitemap.ts` + `src/app/opengraph-image.tsx` patterns (Stage 4), `e2e/` `@ci`
suite (Stages 2/4/5).

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

Still deferred (do not decide early): draft preview mechanism → Stage 5 brief; Utopia scale
parameters → tuned on the Stage 2 reading template; tag vocabulary → emerges from first posts;
first-load JS budget → baseline recorded at Stage 2.

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
  a strict `script-src` without accounting for it.
- **pnpm 11 `allowBuilds` blocks esbuild** (velite's transitive dep). `pnpm-workspace.yaml` shipped
  with a literal placeholder line under `allowBuilds` that broke `pnpm exec` entirely until it was
  set to a real value; now `esbuild: true` with a comment. Any new dependency with a build script
  needs its own entry there.
- **`prettier --check .` covers `.html` but lint-staged only formats json/css/md** — the Stage B
  brand-board HTMLs slipped through unformatted and broke master CI on the PR #72 merge. Boards and
  `eslint.config.mjs` reformatted on `feature/blog-stage-1`; consider widening the lint-staged glob
  later so the two can't disagree again.
- **First-load JS baseline** for blog routes: record from `next build` output at Stage 2 in this
  doc; growth is a finding at every later gate, never silent.
- **Brand monogram owes a refinement pass** — small-size distinctiveness (favicon/app-icon test) —
  before Stage 2 ships (`docs/brand/brand.md` §Open refinements). Nick rules the result.
- **"Career tickets" glossary gap** — glossary-guard advisory from the Stage 0 review; a
  carnival-side term, not blog work. Parked; do not fix under a blog branch.

## 8. Build order

1. ~~**Stage 1 — content pipeline + typed layer**~~ ✅ done (2026-07-17, `feature/blog-stage-1`,
   gate `pnpm validate` green, 162 tests) — see §1.
2. **Stage 2 — routes + reading template** (next): `/blog`, `/blog/[slug]`; brand-prefixed Utopia tokens
   land in `@theme`; Shiki highlighting; prev/next; reading time; SiteNav Blog link; record JS
   baseline. Human gates: reading feel + monogram pass.
3. **Stage 4 — SEO surfaces**: `generateMetadata`, per-post OG image, `BlogPosting` JSON-LD, sitemap
   extension, RSS.
4. **Stage 5 — tag pages + Draft polish**; docs-scribe close-out; this doc gains a shipped-state
   summary (the `ball-toss-game-built.md` pattern).

Every stage: carnival-context Brief before, Absorb after, journal paragraph appended to
`docs/blog/journal.md`. Branch per stage, PR to master.

## 9. What just happened

**Stage 1 complete** (2026-07-17, `feature/blog-stage-1`, gate `pnpm validate` fully green — 162
tests). The content pipeline and typed layer landed exactly as specified: velite + Zod contract,
two seed Posts (one published with a code block for the Stage 2 highlighting test, one Draft),
`publishedPosts` as the single public read with tests beside it, and the full toolchain sweep
(§1). The three.js ESLint ban came in a stage early. The stage was mechanical — the specs absorbed
all the thinking — and both surprises were toolchain seams, not design: the pnpm 11 `allowBuilds`
gate and the prettier/lint-staged HTML disagreement that turned master red on the PR #72 merge;
both fixed on this branch (§7). Before that, Stage 0 + Stage B (PR #72) locked the specs
(ADRs 0008–0011) and ruled the **Blueprint** brand.
