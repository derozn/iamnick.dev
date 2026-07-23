# Blog — Agentic delivery workflow

> Design doc and learning artefact (ADR-0010). Two pipelines: the **build workflow** that delivers the blog feature, and the **authoring workflow** that ships each post afterwards. For every mechanism choice this doc records the reasoning **and the simpler alternative that was rejected** — the point is to learn when each tool earns its complexity, not just to use them.
>
> Drafted 2026-07-16 during discovery. The `.claude` components described here were built on 2026-07-23 (`feature/blog-authoring-pipeline`), after the build stages shipped and only once they were needed. This doc remains the design record; the components themselves live under `.claude/`.

## Principles

1. **Simplest mechanism that works.** Main-session inline is the default. Escalate only when something specific pays for it: a sub-agent for context isolation or independence, a skill for a fixed user-invoked procedure, a worktree for isolation of a half-done risky change, a loop for genuinely unattended repetition (nothing here qualifies).
2. **Every stage ends in a verifiable gate.** `pnpm validate`, `@ci` E2E, artifact screenshots, or a named human gate — never "looks done".
3. **Human gates are fixed and few:** ADR approval, reading-feel sign-off, GPU visual review, reading the edited draft, and the PR merge. Agents never orchestrate and nothing auto-merges.
4. **The workflow feeds the journal.** Each stage close appends a dated paragraph to `docs/blog/journal.md` — the flagship posts are written from this.

## Mechanism map (summary)

| Stage                             | Mechanism                                      | Gate                                                                   |
| --------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| 0. ADR + handoff bootstrap        | inline + carnival-context + glossary-guard     | Nick approves ADR-0008 (human)                                         |
| B. iamnick brand discovery        | inline + **brandkit skill** for concept boards | **Nick's creative rulings** (human) — brand tokens + `docs/brand/` doc |
| 1. Content pipeline + typed layer | inline (briefed)                               | `pnpm validate` (schema tests are the teeth)                           |
| 2. Routes + reading template      | inline (briefed) + glossary-guard on diff      | validate + `@ci` blog E2E + verify skill + Nick reads the feel (human) |
| 4. SEO surfaces                   | inline (briefed)                               | validate + `@ci` contract tests (RSS/sitemap/JSON-LD/OG)               |
| 5. Tag pages + draft polish       | inline (briefed); docs-scribe close-out        | validate + extended `@ci` blog E2E                                     |
| Authoring (per post)              | `/publish-post` skill orchestrating passes     | two human gates: read the edit, merge the PR                           |

Stage B blocks Stage 2 only — Stages 0, 1 need no brand. The former Stage 3 (site-wide Utopia migration of live carnival surfaces) is **deleted** (ADR-0011): the carnival keeps its own tokens; stage numbers are kept to preserve references. The brand rollout to `StaticCv` and the carny's counter is a follow-on workstream, not part of the blog build.

Every stage is bracketed by **carnival-context**: Brief before (from `docs/redesign/blog-handoff.md`), Absorb after (outcome, surprises, journal paragraph). Branch per stage, PR to master — the site is live; each slice must leave production shippable.

## Part 1 — Build workflow

### Stage 0 — Pipeline ADR + handoff bootstrap

**Produces:** ADR-0008 confirmed (tool choice re-verified against current docs at build time, not from memory); CONTEXT.md glossary entries (Post, Tag, Draft — plain English; the blog is an iamnick-brand surface, so no carnival-register naming, per ADR-0011); `docs/redesign/blog-handoff.md` seeded in the house structure (ball-toss handoff is the gold standard), pointing at the `docs/blog/` specs.

**Mechanism:** main session inline for verification and ADR confirmation; carnival-context (Absorb) writes the handoff doc; glossary-guard reviews the new entries.

- _Why inline:_ the ADR is a conversation with Nick, not delegable work.
- _Rejected:_ skipping the ADR and deciding in-branch — tool choices are exactly what rots without a numbered record, and docs law requires it.

**Gate:** Nick approves ADR-0008. No code, so no validate run.

### Stage B — iamnick brand discovery (blocks Stage 2 only)

**Produces:** the iamnick brand — palette, fluid type/space scale via Utopia (ADR-0009 parameters set here), voice notes, wordmark treatment (the existing iamnick.dev wordmark stays original) — recorded as a brand doc under `docs/brand/` and brand-prefixed tokens ready for `@theme`. Concept boards are generated with the **brandkit skill**; candidates are iterated with Nick until he rules.

**Mechanism:** main session inline driving the brandkit skill.

- _Why a skill:_ brand boards are generative design artefacts, exactly what brandkit exists for; the session curates, Nick decides.
- _Rejected:_ delegating brand definition to an agent — creative rulings are Nick's by definition; an agent would converge on taste nobody chose.

**Gate:** Nick's creative sign-off on the brand doc + tokens (human). Nothing downstream consumes an unapproved brand.

### Stage 1 — Content pipeline + typed layer

**Produces:** Velite wired in; `content/blog/` with two seed posts (one published, one `draft: true`); Zod frontmatter schema (`title`, `description`, `date`, `updated`, `tags`, `draft`, slug); derived reading time and excerpts; a typed accessor module mirroring `src/content/cv.ts` with Vitest schema tests beside it — including the single `publishedPosts` accessor; knip/ESLint taught about generated output.

**Mechanism:** main session inline, briefed by carnival-context.

- _Why:_ foundational decisions here ripple into every later stage; keeping them in the main session preserves the decision trail for the handoff doc.
- _Rejected:_ a builder sub-agent — no parallelism to exploit and no context worth isolating; it would just re-read everything the session already knows. (House rule anyway: no agent writes feature code.)

**Gate:** `pnpm validate`. The schema tests are the real teeth — invalid frontmatter must fail the build, not render wrong.

### Stage 2 — Routes + reading template (first shipped brand surface)

**Produces:** `/blog` and `/blog/[slug]` via `generateStaticParams`; the reading template built entirely on the Stage B brand — the **brand-prefixed Utopia tokens land in `@theme` here**, consumed only by iamnick-brand surfaces; the blog never touches the carnival's px tokens or its letterpress/ticket utilities (ADR-0011). Build-time Shiki-class highlighting; prev/next; reading time display; the Blog link in `SiteNav`. Record the per-route first-load JS baseline from `next build` in the handoff doc.

**Mechanism:** main session inline (briefed); glossary-guard on the diff before PR.

- _Why tokens-land-here:_ the blog is the brand's first shipped surface — the tokens are proven on real long-form content before any rebrand sweep reuses them.
- _Rejected (worktree):_ blog routes share almost no files with the carnival; a plain branch is fine here.

**Gate:** `pnpm validate` + new `e2e/blog.spec.ts` tagged `@ci` (index renders, post renders, code block highlighted, prev/next, draft slug 404s) + the verify skill for a real look + **Nick signs off the reading feel** (visual identity is a Needs-Nick class of decision).

### Stage 3 — deleted (ADR-0011)

The site-wide Utopia migration of live carnival surfaces no longer exists: the carnival keeps its own fixed tokens as a self-contained identity. What replaces it is smaller and out of the blog build entirely — a follow-on **brand rollout sweep** applying the Stage B tokens to `StaticCv` and the carny's counter (plain DOM pages; no canvas risk, no GPU gate). Stage numbering is preserved so references stay valid.

### Stage 4 — SEO surfaces

**Produces:** per-post `generateMetadata`; auto OG image per post via the `opengraph-image.tsx` ImageResponse pattern; `BlogPosting` JSON-LD; `sitemap.ts` extended with post and tag URLs; RSS.

**Mechanism:** main session inline (briefed). Small, mechanical, fully specified by ADR-0002.

- _Rejected:_ a builder sub-agent running in parallel with Stage 3 — tempting, but these surfaces read the typed content layer, not `globals.css`, so there is no real contention to escape; sequential inline is simpler, and this build is itself journal content — fewer moving parts reads better.

**Gate:** `pnpm validate` + `@ci` contract assertions in the `api.spec.ts` style: RSS is valid XML and excludes drafts; sitemap contains post URLs; JSON-LD parses; the OG image route returns an image. These are the regressions that rot silently — they must be CI-gated, not eyeballed.

### Stage 5 — Tag pages + draft/preview polish

**Produces:** `/blog/tags/[tag]` static pages; the draft preview mechanism (dev-only visibility vs Next `draftMode` — decided in this stage's brief); draft exclusion everywhere via `publishedPosts` so it cannot drift.

**Mechanism:** main session inline (briefed).

**Gate:** `pnpm validate` + extended `@ci` blog spec (tag page lists the right posts; a draft is absent from index/RSS/sitemap but previewable in dev).

**Close-out:** docs-scribe syncs STATUS.md, `architecture.md`, PLAN.md staleness and README; carnival-context final Absorb; the handoff doc gains a shipped-state summary (the `ball-toss-game-built.md` pattern).

### Journal capture (all stages)

Every stage brief includes one standing line: at Absorb, carnival-context also appends a dated paragraph to `docs/blog/journal.md` — what was decided, what surprised us, what the human gate changed.

- _Why:_ one paragraph per stage is nearly free and captures the texture `git log` loses.
- _Rejected:_ a Stop-hook or scheduled session-notes automation — the journal's value is judgment about what mattered, which a hook cannot supply; a stale automated log is worse than none.

## Part 2 — Authoring workflow (repeatable, per post)

**Trigger:** Nick has a raw draft at `content/blog/<slug>.mdx` with `draft: true` and runs **`/publish-post <slug>`** (new project skill). Passes run mechanical-before-judgmental, cheap-before-expensive; every pass is individually skippable by argument.

1. **Structural pass** (inline in the skill): frontmatter completeness against the schema, slug/filename agreement, tags checked against the existing vocabulary (new tags are a warning, keeping the set tight), reading-time sanity. Fails fast before any prose work.
2. **Fact + SEO review** (**post-reviewer** agent, new, read-only): verifies every technical claim against the repo — cited paths exist, ADRs say what the post claims, git history supports "we did X then Y" narratives. The posts are _about this repo_, so the repo is the fact source. Plus SEO quality: description length, title, heading structure, internal links resolve. Returns findings with file:line and a verdict line (`POST: CLEAN` / `POST: n findings`), glossary-guard house format.
3. **Voice pass** (existing **avoid-ai-writing** skill, edit-in-place against `docs/brand/voice.md` — the binding tone-of-voice reference, captured from Nick 2026-07-17): AI-ism removal and register correction — runs _after_ fact fixes so it does not polish sentences about to be rewritten. The same rule applies outside this pipeline: **any visitor-facing copy in a build-stage PR (UI strings included) is written against voice.md and final-passed through avoid-ai-writing** before the stage gate.
4. **Glossary pass** (existing **glossary-guard** agent) on the diff: banned terms bite hardest in public prose.
5. **Human gate 1 — Nick reads the edited draft.** The skill stops and presents a changelog of what every pass changed (itself journal material). Nick edits and approves.
6. **Ship:** flip `draft: false`, branch, `pnpm validate`, **code-review skill at low effort** on the diff (catches broken MDX and embedded code, skips prose nitpicking), open the PR.
7. **Human gate 2 — publishing is the merge.** Nick merges. Nothing auto-merges, ever.

- _Why a skill as orchestrator:_ a fixed, user-invoked procedure with two human stops is precisely what a slash skill is; the main session stays the conductor with Nick in the loop.
- _Rejected:_ an editor-in-chief agent running all passes — agents cannot pause for Nick mid-flow, and it wraps three existing components in a fourth for no isolation gain.
- _Rejected:_ a `/loop` or scheduled run — publishing cadence is human-paced.

## Part 3 — New `.claude` components (total: 2, hard cap)

1. **`.claude/skills/publish-post/SKILL.md`** — the `/publish-post` editorial pipeline orchestrator. Skill, not agent: no context isolation needed, must interleave human gates, composes existing skills and agents.
2. **`.claude/agents/post-reviewer.md`** — read-only reviewer (tools: Read, Bash, Glob, Grep — glossary-guard's scope) that fact-checks post claims against the repo and audits SEO/frontmatter quality. An agent because fact-checking burns context tracing files and git history, and an isolated reviewer that did not help write the prose is a genuinely independent check.
   - _Rejected merges:_ into glossary-guard (one concern per reviewer is the house pattern) or inline into the skill (context bloat; no independence).

**Explicitly not created:**

- **blog-context agent** — carnival-context's charter already generalises to any `docs/redesign/<feature>-handoff.md`; a second keeper would fork the source of truth.
- **builder agents** — the main session builds; no agent writes feature code in this house.
- **a separate SEO-checker** — same evidence base as fact-checking; one pass, one reviewer.
- **journal automation** — see Journal capture above.

## Part 4 — Risks and mitigations

1. **Two token systems drifting or cross-contaminating** (replaces the deleted live-HUD migration risk): brand tokens are namespace-prefixed in `@theme`; carnival components stay off brand tokens and vice versa (review convention, candidate for an ESLint rule during the rebrand sweep). Secondary: brand discovery stalling blocks Stage 2 — but only Stage 2; Stages 0–1 proceed brand-free. (ADR-0009, ADR-0011.)
2. **MDX bundle bloat:** build-time MDX and build-time highlighting only; an ESLint `no-restricted-imports` boundary banning `three`/`@react-three/*` under blog code (clone the existing `@/content/cv` ban in `eslint.config.mjs`); first-load JS baseline recorded at Stage 2, growth is a finding at every later gate.
3. **Workflow over-engineering** (the meta-risk): two new components, hard cap; every pass skippable; standing review after three published posts — any pass that has not changed an outcome is deleted, and the pruning is itself a post.
4. **Pipeline tool churn:** ADR-0008 names the hand-rolled fallback so a later swap is a recorded option, not a crisis; content files and schema survive a loader rewrite unchanged.
5. **Draft leakage:** single `publishedPosts` accessor feeding params, index, tags, sitemap, RSS; `@ci` test asserting a known draft slug 404s and is absent from feeds.
6. **Docs drift:** no stage closes without Absorb; docs-scribe closes Stage 5; glossary entries land at Stage 0 so five stages of code never invent terms ahead of the glossary.
