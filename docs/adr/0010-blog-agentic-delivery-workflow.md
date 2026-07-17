# 0010 — Agentic delivery workflow for the blog

Status: accepted (2026-07-16)

The blog is delivered through an explicitly designed agentic workflow, recorded in `docs/blog/agentic-workflow.md`: six independently mergeable build stages bracketed by carnival-context Brief/Absorb, and a repeatable `/publish-post` authoring pipeline in which Nick drafts and AI acts as the editorial team. Exactly **two** new `.claude` components are created — a `publish-post` orchestrator skill and a read-only `post-reviewer` agent — and the workflow doc records, for every mechanism choice, the reasoning and the rejected simpler alternative.

## Why

The blog is positioned as an AI-build-journal: the delivery process is itself content, so it must be deliberate, recorded and reviewable rather than ad hoc. The governing principle is **simplest mechanism that works** — main-session inline by default; a sub-agent only where context isolation or independence pays (post-reviewer fact-checks prose it did not help write); a skill only for a fixed user-invoked procedure with human stops (`/publish-post`) or a generative-design task it exists for (brandkit at Stage B); a worktree only where a half-done change must not block a deployable main checkout. Human gates are fixed: ADR approval, brand sign-off, reading-feel sign-off, reading the edited draft, and the merge itself. Nothing publishes without Nick merging a PR.

## Considered options

- **Ad hoc sessions, no designed workflow** — rejected: loses the decision trail the journal posts are made of, and repeats the pre-handoff-doc drift the doodle wall build already solved.
- **An orchestrating "editor-in-chief" agent running all authoring passes** — rejected: agents cannot pause for Nick mid-flow, and it wraps three existing components in a fourth for no isolation gain. The main session, driven by a skill, is the conductor — matching the house rule that agents never orchestrate.
- **A larger component set** (blog-context agent, builder agents, separate SEO skill, journal automation via hooks) — rejected item by item in `docs/blog/agentic-workflow.md` §Not created: carnival-context already generalises to any feature handoff doc; no agent writes feature code in this house; the SEO check shares an evidence base with fact-checking; a journal's value is judgment, which a hook cannot supply.

## Consequences

- Two new components, hard cap: `.claude/skills/publish-post/` and `.claude/agents/post-reviewer.md` (read-only, glossary-guard tool scope). Built in build Stage 0–5 era, not before.
- Every build stage ends in a verifiable gate (`pnpm validate`, `@ci` E2E, artifact screenshots, or a named human gate) and an Absorb into `docs/redesign/blog-handoff.md`.
- carnival-context additionally appends a dated paragraph per stage to `docs/blog/journal.md` — raw material for journal posts; deliberately manual, not hook-automated.
- Every `/publish-post` pass is individually skippable by argument; after three published posts the pipeline is reviewed and any pass that has not changed an outcome is deleted. The pruning is itself a post.
- The workflow doc is the reference for future feature workflows; if practice diverges from it, docs-scribe syncs or a superseding ADR records the change.
