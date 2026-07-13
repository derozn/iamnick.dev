# Refactor execution state — chore/standards-refactor

> **What this is.** The shared context manager for the standards refactor
> (`docs/refactor-plan.md`). Every sub-agent working a refactor task reads this
> file first; the orchestrating session folds results back in after each step.
> It is committed so progress survives sessions. When the refactor completes,
> this file is deleted — `refactor-plan.md` + the ADRs are the durable record.

## Ground rules for agents

- Read `docs/refactor-plan.md` (the phase you're working), `CONTEXT.md`
  (glossary — use CV not resume, Overlay/HUD as defined), and
  `docs/CODE_QUALITY_AUDIT.md` "Conventions for the next agent" before writing.
- Gate: `pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`. Never run
  the build while a dev server holds `.next`.
- Approved dependency list in refactor-plan Constraints is CLOSED — no other
  additions.
- Record deviations from the plan here, not silently.

## Phase status

| Phase                      | Status                           | PR  |
| -------------------------- | -------------------------------- | --- |
| 1 — Dead code purge        | IN PROGRESS (started 2026-07-13) | —   |
| 2 — Component architecture | pending                          | —   |
| 3 — Config/deps/varlock    | pending                          | —   |
| 4 — Fortune API + a11y     | pending                          | —   |
| 5 — Dedup & extraction     | pending                          | —   |
| 6 — Tests & tooling        | pending                          | —   |
| 7 — Ops hardening          | pending                          | —   |

## Phase 1 working state

- Branch cut from `feature/fortune-teller` @ `9fa7ee9` (escape-hatch path —
  persona QA still pending, refactor not blocked on it).
- Dead-code re-verification: DONE — all targets confirmed zero live importers;
  survivors (JsonLd, fonts, PostFX-via-SafePostFX, matchMedia helper) confirmed live.
- Deletions: DONE — 163 files (retired three/ scene + models/carnival 9.7MB +
  6 textures + organisms cascade + atoms + ui-modules/image + src/modules +
  src/hooks + IntersectionObserver test helper). eslint glob updated.
- Store cleanup: DONE — vestigial fields stripped, iso header comment,
  scene.test.ts updated.
- Docs rewrite: DONE — README.md + STATUS.md (agent), ADR-0007 written,
  CONTEXT.md Midway/Step-in entries corrected to free-roam.
- Gate: PASSED 2026-07-13 — typecheck ✓ lint ✓ 40 tests ✓ build ✓; retired-path
  greps clean; knip: no orphans from the purge (also deleted the dead
  `src/content/index.ts` barrel it found). Screenshots: overview pixel-identical
  to the 2026-07-09 baseline; ball-toss fly-in + step-in card render correctly.

## Phase 2 result (2026-07-13)

- Tree is now `cv/ nav/ overlays/ three/` (`ui/` created lazily later). All
  moves via git mv; `StaticResume` → `cv/StaticCv` (+ `.static-cv` CSS class);
  fonts → `src/lib/fonts/` with `src:` depths fixed; organisms/ + ui-modules/
  gone. cv-import ban lint-ENFORCED with negative test (injected violation
  fired; exceptions SectionContent/CareerTickets hold).
- Gate: typecheck ✓ lint ✓ 40 tests ✓ build ✓; refactor-verifier sweep CLEAR
  (zero live old-path refs, font woff2 paths resolve); glossary-guard CLEAN
  (one advisory: `id="resume-*"` attrs in StaticCv — carry-over, left).
- Screenshots: overview pixel-identical; Career panel + High Striker step-in
  card/HUD render from new paths. Gotcha for future sessions: a stale
  `next start` on :3000 makes new `pnpm start` fail EADDRINUSE and shots hit
  the OLD build — check `lsof -iTCP:3000` first.
- Reusable sub-agents created: `.claude/agents/{refactor-verifier,docs-scribe,
glossary-guard}.md` — register on session reload; this session ran their
  briefs via generic agent types.
- Docs-scribe flagged (not fixed, historical docs): fortune-teller-ai-handoff.md
  status header stale ("approved, not started" but Zara is built);
  hud-letterpress-overhaul.md "no post-processing" claim pre-dates SafePostFX.

## Hotfix (2026-07-13, out-of-phase)

- Nick reported the fortune teller dead when asking a question. Root cause:
  the ANTHROPIC_API_KEY in .env.local is INVALID (Anthropic returns 401) and
  the route's silent stream catch turned that into an empty 200 — dead air in
  the panel. Hotfix (Phase 4's "log the catches" pulled forward): model-call
  failure before any text now serves a canned Reading + console.error; mid-
  reading failure logs and ends. Regression test added (12 route tests).
- STILL OWED BY NICK: a valid ANTHROPIC_API_KEY (.env.local + Vercel) — until
  then visitors get canned readings via the fallback, not real Zara.
- Phase 4 note: the AI SDK rewrite must PRESERVE this fallback behaviour
  (its done-when already includes the real-key manual smoke).

## Verified facts (carry across phases)

- Reduced-motion tier renders `StaticResume` as the VISIBLE page (`clip: auto`
  in globals.css) — it is user-facing UI, not just crawler content. Its styling
  is self-contained; organisms deletion does not affect it.
- `JsonLd` is live via `layout.tsx`; fonts live via `layout.tsx` — both survive
  Phase 1, move in Phase 2.
- Screenshot rig = scenario scripts in `/tmp/shot/` (`npcs.mjs`,
  `fortune-panel.mjs`, …) — NOT a single `shot.mjs`. Uncommitted until Phase 6.

## Handovers to later phases (from Phase 1 gate)

- Phase 3: remove now-unused `class-variance-authority` dep (only consumers were
  deleted atoms); add `@banterstudiosuk/prettier-config` to devDependencies
  (knip: unlisted but referenced by .prettierrc.json).
- Phase 6 knip config: ignore/entry rules needed for `scripts/scene-map.mjs`
  (manual CLI), game-config tuning exports, `__resetAudioForTests`.

## Deviations from plan (Phase 2)

- Conventions codified in `docs/redesign/architecture.md`, NOT CONTEXT.md as
  the plan literally said — CONTEXT.md is glossary-only (grill-session rule).

## Deviations from plan (Phase 1)

- `stepIn`/`exit` NOT renamed: CONTEXT.md defines Step-in as canonical domain
  language — the glossary overrides the audit's rename suggestion. Plan updated.
- `test/helpers/IntersectionObserver.ts` deleted (added scope): verified orphan
  once useOnScreen test died; `test/setup.ts` has its own inline mock.
- `src/content/index.ts` deleted (added scope): dead barrel, zero importers —
  knip finding; aligns with the Phase 2 no-barrels convention.
- CONTEXT.md Midway/Step-in entries corrected — the glossary itself still
  described the retired on-rails camera; aligned with ADR-0007.
