# Blog — Product Requirements (v1)

> What the blog is and what launch must include. Decisions and their sources live in `docs/blog/discovery.md`; how it gets built lives in `docs/blog/agentic-workflow.md`. Status: drafted 2026-07-16, follows the 2026-07-16 discovery interviews.

## Problem statement

iamnick.dev demonstrates creativity and craft through the Dark Carnival, but the site has almost no indexable long-form text and no surface that shows how Nick thinks and works over time. Recruiters and hiring managers get the wow; they do not get the reasoning. Meanwhile Nick is deliberately building his AI-engineering practice — sub-agents, skills, spec-driven delivery — and that learning currently evaporates into session transcripts.

The blog solves both at once: it is the site's primary indexable-text / SEO surface (ADR-0002), and its flagship content is an **AI-build-journal** — posts documenting how this site is built with agentic workflows, written by Nick with AI as the editorial team. The delivery process is designed to generate the raw material (decision logs, stage journal) that the posts are made of.

## Audience

1. **Dev peers** — senior front-end/full-stack engineers interested in agentic AI practice. Depth wins them.
2. **Recruiters and hiring managers** — skim for signal: clarity of thought, seniority, communication. Polish and honest voice win them.
3. **Nick as author** — the pipeline must make publishing cheap enough that posts actually ship.

## User stories and acceptance criteria

**Reader**

- As a reader, I can browse `/blog` and open any post, with the page loading fast and reading comfortably at any viewport.
  - Post pages mount no live WebGL canvas; `three` / `@react-three/*` are banned imports under blog code (ESLint boundary).
  - Fluid type/space via the Utopia scale (ADR-0009); the article surface carries the **iamnick brand** (ADR-0011, defined in brand discovery) — no carnival styling or vocabulary on blog surfaces.
  - Code blocks are syntax-highlighted at build time; no client-side highlighter ships.
  - Each post shows reading time and previous/next links.
- As a reader, I can browse posts by tag at `/blog/tags/[tag]`.

**Recruiter**

- As a recruiter arriving from a search result or a link, I get a fast, legible page whose title, description and social preview image are correct.
  - Per-post `generateMetadata` from frontmatter; auto-generated OG image per post; `BlogPosting` JSON-LD; post and tag URLs in the sitemap.
  - Blog pages target Lighthouse SEO/Best-Practices ≈ 100 (PLAN.md target).

**Author (Nick)**

- As the author, I write a post as an MDX file in `content/blog/` with schema-validated frontmatter; invalid frontmatter fails the build, not production (ADR-0008).
- As the author, I can keep `draft: true` posts in the repo: previewable in development, absent from the index, tag pages, sitemap, RSS and static params in production — enforced by a single `publishedPosts` accessor and an `@ci` test.
- As the author, I publish through `/publish-post`: structural check, fact/SEO review against the repo, voice pass, glossary pass, then I read the edited draft, approve, and merge the PR. Nothing publishes without my merge.

**Subscriber**

- As a returning reader, I can subscribe to an RSS feed that contains published posts only.

## Launch content

Launch with at least two real posts (the Velite pipeline is seeded with one published + one draft during the build): the natural first posts are the discovery/spec process itself and the build journal of Phase 2 — the pipeline documenting its own construction.

## Out of scope (v1)

- Comments, reactions, view counters.
- Search and pagination (revisit when the archive justifies them).
- Newsletter / email subscription (RSS only).
- Any CMS or database-backed content (ADR-0002 stands; MDX in repo).
- A blog attraction inside the 3D carnival — the global nav link is the only entry point for now. The blog is an iamnick-brand surface, not a carnival one (ADR-0011).
- The brand rollout beyond the blog (`StaticCv`, the carny's counter) — a follow-on sweep, not blog v1.
- Analytics beyond what the site already has.

## Success measures

- Blog routes ship with Lighthouse SEO/Best-Practices ≈ 100 and no `three` in their bundles (first-load JS baseline recorded at build Stage 2, growth treated as a finding).
- Three posts published through the `/publish-post` pipeline, followed by the scheduled pruning review of the pipeline itself (ADR-0010).
- Every build stage's decisions and surprises captured in `docs/blog/journal.md` — the flagship posts can be written from the repo alone.
