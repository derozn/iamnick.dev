---
name: publish-post
description: Editorial pipeline that takes a Draft blog Post from raw to publishable. Runs the structural check, the post-reviewer fact/SEO pass, the voice pass and the glossary pass, then stops for Nick to read the edited Draft. Publishing is Nick's merge, never automatic. Use when Nick says to publish, edit or run the pipeline on a Post.
argument-hint: <slug> [--skip=structural|facts|voice|glossary|review]
---

# /publish-post — the editorial pipeline

Take `content/blog/<slug>.mdx` (a Draft: `draft: true`) through the editing
passes and up to the publish PR. ADR-0010 designed this; the spec is
`docs/blog/agentic-workflow.md` Part 2. You are the conductor and Nick is the
editor-in-chief: two human gates, and nothing merges itself.

Order of operations is mechanical before judgmental, cheap before expensive.
Any pass can be skipped with `--skip=<pass>`; say so in the changelog when one
was. Track what every pass changes as you go — the changelog at gate 1 is
built from it, and it is journal material.

Rules that bind throughout: Nick drafts, AI edits, never ghost-writes. All
edits move prose toward `docs/brand/voice.md`, never away. No em dashes, no
setup-then-swerve, no template structures (the global writing rules apply to
every line you touch).

## 1. Structural pass (inline, fail fast)

Read the Post and check before any prose work:

- Frontmatter complete and well-formed per `velite.config.ts`: title 3–99
  chars, description 10–160, isodate `date` (and `updated` if present),
  `draft: true` still set, tags an array.
- `slug` field agrees with the filename.
- Tags checked against the existing vocabulary (union of tags across
  `content/blog/*.mdx`). A NEW tag is a warning to raise with Nick, not an
  error — the vocabulary stays deliberately small.
- Reading-time sanity: run `pnpm content` and confirm the Post builds and its
  derived reading time is plausible for the word count.

Anything broken here stops the pipeline. Fix or ask; do not run prose passes
over a Post that fails its contract.

## 2. Fact + SEO pass (post-reviewer agent)

Launch the **post-reviewer** agent (`.claude/agents/post-reviewer.md`) on the
Post. It is read-only and independent; you apply the fixes it reports.

- Fix blocking findings in the Post (or, where the Post is right and the doc
  is stale, tell Nick — never silently rewrite history to match a doc).
- Bring advisory findings to gate 1 rather than churning the prose over them.

Runs before the voice pass on purpose: no point polishing sentences about to
be rewritten for factual accuracy.

## 3. Voice pass (avoid-ai-writing skill)

Run the **avoid-ai-writing** skill edit-in-place on the Post with
`docs/brand/voice.md` as the profile. This is the binding register: front-load
the point, short declaratives, contractions, first person singular, dry
British, the hard bans (no "we" for solo work, no emoji, no exclamation
marks, no em dashes, no setup-then-swerve, no colon-list templates).

Edit toward Nick's voice, never away from it. Where a sentence is already
his, leave it alone — the pass removes AI tells, it does not impose style.

## 4. Glossary pass (glossary-guard agent)

Launch **glossary-guard** on the Post diff. Banned `_Avoid_` terms bite
hardest in public prose ("resume", "journey", "category" for Tag, and the
rest of `CONTEXT.md`). Apply blocking findings; carry advisory ones to
gate 1.

## 5. HUMAN GATE 1 — Nick reads the edited Draft

Stop. Present:

- The changelog: what each pass changed and why, pass by pass, plus anything
  skipped and every advisory finding left open.
- The edited Post (point at the file; quote only what needs a decision).

Nick edits and approves. Do not proceed on silence, on your own judgment, or
on anything short of his explicit go-ahead. His line-edits here are also the
calibration input for `voice.md` — if they show a voice rule is wrong, update
`docs/brand/voice.md` from what survives (never from taste).

## 6. Ship

Only after gate 1 approval:

1. Flip `draft: false` (and set `updated` if the Post changed materially
   since its `date`).
2. Branch `post/<slug>` off fresh master; commit the Post.
3. `pnpm validate` — the content build is the teeth; a contract violation
   fails here.
4. Run the **code-review** skill at LOW effort on the diff: it catches broken
   MDX and embedded code, and skips prose nitpicking (prose was gates 1–4).
5. Open the PR to master. The body carries the changelog from gate 1.

## 7. HUMAN GATE 2 — publishing is the merge

Nick merges the PR. Nothing auto-merges, ever. After the merge, offer to
append a dated paragraph to `docs/blog/journal.md` if the pipeline run
surfaced anything worth recording (a voice.md calibration, a new tag ruling,
a pass that earned or failed to earn its keep).

## Standing review

After three published Posts, review the pipeline: any pass that has not
changed an outcome gets deleted, and the pruning is itself a Post
(`docs/blog/agentic-workflow.md` Part 4, risk 3).
