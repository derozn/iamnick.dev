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

| Phase                      | Status                                                  | PR  |
| -------------------------- | ------------------------------------------------------- | --- |
| 1 — Dead code purge        | DONE 2026-07-13 (484e26c)                               | —   |
| 2 — Component architecture | DONE 2026-07-13 (0b6a48a)                               | —   |
| 3 — Config/deps/varlock    | DONE 2026-07-13 (8eab757; varlock runtime deferred)     | —   |
| 4 — Fortune API + a11y     | DONE 2026-07-13 (Upstash deferred; real-key smoke owed) | —   |
| 5 — Dedup & extraction     | DONE 2026-07-13                                         | —   |
| 6 — Tests & tooling        | DONE 2026-07-13                                         | —   |
| 7 — Ops hardening          | DONE 2026-07-13 (deployable; creds gated)               | —   |

> Table hygiene note: prettier realigns this table's column padding, which
> silently breaks string-replace edits. EDIT IT BY HAND (or re-pad after).

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

## Phase 3 result (2026-07-13)

- All "latest" deps pinned to caret ranges matching the lockfile (react 19.2.7,
  next 16.2.10, three 0.185.1, …); `class-variance-authority` removed (Phase 1
  handover); `@banterstudiosuk/prettier-config@^0.2.0` now a real devDep (was
  phantom-resolving; effective config identical, zero reformat).
- pnpm warning KILLED: dead `pnpm.*` keys removed from package.json. pnpm 11.6
  workspace syntax is `allowBuilds:` (the older onlyBuiltDependencies list
  ERRORS) — local gitignored pnpm-workspace.yaml and the CI write-step both
  updated; CI's step also got a YAML block-scalar fix.
- App Router: redundant `dynamic = 'auto'` and empty `<head />` removed;
  `src/lib/site.ts#SITE_URL` feeds metadataBase/OG/robots/sitemap.
- varlock: SCHEMA-FIRST. `.env.schema` committed (all vars @optional,
  default-sensitive, redacted CLI output verified); `pnpm env:check` script +
  CI step; `.env.example` retired (README updated). Runtime integration
  DEFERRED — plugin hard-requires the @next/env override; pnpm 11 reads
  overrides only from the gitignored pnpm-workspace.yaml. Unblock: test a
  committed settings-only workspace file on a Vercel preview (Nick), then
  `pnpm add -E @varlock/nextjs-integration` and wire the plugin.
- Gate: typecheck ✓ lint ✓ 41 tests ✓ build ✓ install warning-free ✓.

## Phase 4 result (2026-07-13) — Upstash sub-step DEFERRED by Nick

- 4a zod (a99fa3a): BodySchema/ChatMessageSchema replace hand guards; malformed
  Origin → 403 (try-catch); unparseable body logged. Fixtures pass unchanged.
- 4b AI SDK (2d33090 + 0364ef2): `ai`@7 + `@ai-sdk/anthropic` replace
  `@anthropic-ai/sdk`. Server streamText behind the same wire+wrapper. Client
  FortunePanel on useChat + **TextStreamChatTransport** (load-bearing — v7
  default is SSE UI-message protocol, can't parse plain text); the route's
  {role,content}+MAX_TURNS contract preserved via prepareSendMessagesRequest,
  so all 4 panel tests + route fixtures pass unchanged. TWO v7 gotchas found
  against the real API: (1) the SDK MASKS stream errors — textStream ends
  silently, only onError sees the failure; the canned fallback keys off
  zero-chunks-emitted. (2) NOT using toTextStreamResponse() — it would drop the
  fallback. The hotfix's dead-air fix survives the swap (re-verified live).
- 4c focus-trap-react (this commit): FocusTrap round ContentOverlay + the three
  HUD modals (TicketHud/BallToss/HighStriker); initialFocus:false (FortunePanel
  self-focuses), escapeDeactivates:false (store's Escape closes). FortunePanel
  tidy: FORTUNE_ROUTE const, OPENERS "track the CV" note, abort via
  effect-written ref (no-ref-in-render rule). Headless: trap holds across a full
  Tab cycle; stub Reading streams; focus restores to BODY on close.
- Gate: typecheck ✓ lint ✓ 42 tests ✓ build ✓.
- **OWED BY NICK:** (1) valid ANTHROPIC_API_KEY → run the real-key manual smoke
  (one live question + one mid-stream abort on a preview) — the plan's Phase 4
  done-when, unrunnable until the key works. (2) Upstash DB + env vars → the
  DEFERRED 4d rate-limit swap (@upstash/ratelimit; in-memory limiter still live
  meanwhile). Both tracked; neither blocks Phase 5.

## Phase 5 result (2026-07-13)

Behaviour-preserving dedup/extraction — new single homes:

- `src/lib/motion.ts` (EASE ×7 overlay/nav files).
- `synty/demoInstances.ts` (`demoData`, was cast ×4), `synty/materials.ts`
  (`applyEmissive`, was ×2), `synty/textures.ts` (`useEmissiveAtlas`, was ×2),
  `three/shaders/noise.ts` (`NOISE_GLSL` spliced into LoaderVeil + Atmosphere
  shaders — verified pixel-identical), `three/shared/glowTexture.ts`
  (`getGlowTexture` moved out of the Synty layer; 4 importers repointed),
  `three/hooks/useDebugGates.ts` (Scene's ?off/?offp/?bloom gates).
- Leak fix: `three/hooks/useDisposable.ts` → `useDisposeOnUnmount(resource)`,
  applied to LoaderVeil (the real per-visit ShaderMaterial+geometry leak),
  Atmosphere (2 materials), GoldenTickets (2 geometries + material).
  ConfettiBurst NOT touched — its geometry/material are JSX (R3F auto-disposes).
- **DEVIATION:** the plan's `useDisposable(() => new X(), deps)` shape is
  IMPOSSIBLE here — the repo's custom react-hooks rule hard-errors on a
  non-literal `useMemo` dep list. Adapted to `useDisposeOnUnmount(resource)`:
  each site keeps its lint-legal inline `useMemo(..., [literal])` and passes the
  result to the hook. Same dispose-on-change/unmount semantics.
- Gate: typecheck ✓ lint (0 warnings) ✓ 42 tests ✓ build ✓; overview + loader
  veil screenshots pixel-identical to baseline; all dedup greps return single
  homes. Two multi-line-import insertion bugs hit and fixed (HighStrikerHud,
  BulbGlow) — the naive "insert after last import line" heuristic lands inside
  multi-line `import {` blocks; a lesson for Phase 6+.

## React efficiency pass (2026-07-13, Nick-requested, post-Phase-5)

Nick flagged "multiple useEffects / useSceneStore per component" and "rarely use
useEffect". Audited all 11 DOM components against the vercel-react-best-practices
skill. **Honest finding: the components already largely follow best practices** —
atomic zustand selectors are the RECOMMENDED pattern (not a smell), and the
effects genuinely sync with external systems (DOM listeners, focus, body-scroll
lock, rAF, the audio mixer), which is the correct use of useEffect per React's
own "You Might Not Need an Effect". No derive-in-effect or event-as-state
violations existed. Actions look like extra subscriptions but are STABLE
identities in zustand → subscribing costs zero re-renders, so mass-converting
them to getState() would be churn for no gain (skill agrees). Applied only the
three genuine wins:

- **Shared `src/hooks/useKeyDown.ts`** (stable handler-ref pattern): replaced 4
  duplicated raw `keydown` effects (HighStrikerHud, BallTossHud, SiteNav Escape;
  CareerTickets arrows) + split ContentOverlay's combined Escape+scroll-lock into
  the hook + a dedicated scroll-lock effect. Zero raw keydown listeners remain in
  components.
- **Striker reset moved into the `stepIn` store action** (FIX-RESET): deleted
  HighStrikerHud's reset-on-active effect; `stepIn('high-striker')` now resets the
  slice atomically via a shared `FRESH_STRIKER` const. Also dropped the now-dead
  `resetStriker` subscription.
- **FortunePanel stopRef collapsed**: `stop` is session-stable, so the unmount
  cleanup calls it directly on a `[stop]` dep — one effect instead of two.
- Gate: typecheck/lint/42 tests/build green; headless smoke confirmed Escape
  closes panels, arrow deck nav works, striker resets fresh on step-in, Escape
  exits games. Left untouched (correct as-is): AudioDirector's 3 mixer-sync
  effects, DebugBridge window bridge, all atomic render subscriptions.

## Phase 6 result (2026-07-13) — committed in slices

- **Unit (b4ea8ff):** 19 tests — unityTRS axis convention, pyramidPositions,
  makeSampler (stubbed canvas), audio lifecycle (mocked Web Audio).
- **Component (d22864e):** SiteNav, CareerTickets, ContentOverlay (jsdom). Trap
  needs `tabbableOptions.displayCheck:'none'` under jsdom; test files exempted
  from the cv-import ban.
- **knip (10d7d2a):** single-package config, `ignoreExportsUsedInFile` (the
  game-config constants + store type exports are used in-file, no deletions);
  `pnpm validate` + CI step. Clean.
- **E2E (this commit):** `@playwright/test` + `@axe-core/playwright`, SwiftShader
  chromium, desktop + mobile projects, webServer builds+starts with
  FORTUNE_STUB=1. Specs: boot smoke, content journeys, fortune stub round-trip,
  API contract (400/403/413/200), a11y axe sweep + Escape, profiles
  (reduced-motion→no-canvas, mobile Lite), visual (canvas programmatic
  POI-differ gated; DOM overlay = review artifact, NOT pixel-diff — a live
  canvas behind the panel defeats Playwright's element-stability wait, so per
  the plan's "artifact first" staging a gated diff + CI baselines is a
  follow-on). 26 pass / 2 skip. CI e2e job uploads the report.
- **Real a11y fix found by the axe test:** scrollable overlay panels + the
  fortune log were not keyboard-focusable (WCAG 2.1.1) → `tabIndex={0}` added;
  `jsx-a11y/no-noninteractive-tabindex` configured (rule config, NOT an inline
  disable — the zero-disable streak holds) to allow the `log` role.
- Gotcha reconfirmed: `pkill -f "next start"` did NOT kill the server twice;
  kill by PID from `lsof -iTCP:3000 -t`, else e2e hits a stale build.

## Phase 7 result (2026-07-13) — deployable, credentials gated

- **rate-limiter-flexible + Node runtime (abc419c):** replaced the hand-rolled
  limiter; fortune route moved Edge→`nodejs` (LLM proxy latency is the US API
  call, not the PoP; Node removes the lib constraint). Un-rejected in the plan.
- **Sentry (@sentry/nextjs):** `sentry.{server,edge}.config.ts` +
  `src/instrumentation.ts` + `src/instrumentation-client.ts`, all init-gated on
  the DSN → zero footprint until set. `next.config.ts` wraps with Sentry only
  when `SENTRY_DSN` present at build. Fortune's swallowed-error logs now also
  `Sentry.captureException` (no-op without a DSN). `beforeSend` strips request
  bodies (visitor questions are user content).
- **Renovate (`renovate.json`):** groups the R3F ecosystem + AI SDK, batches dev
  deps, auto-merges patches. Activates on GitHub-app install.
- **Vercel Analytics:** `<Analytics />` in `layout.tsx` — auto-activates on Vercel.
- **DEPLOY BLOCKER FIXED:** Phase 3 removed `pnpm.onlyBuiltDependencies` and put
  approvals in the _gitignored_ `pnpm-workspace.yaml` — CI wrote a temp copy, but
  **Vercel had none**, so sharp/@sentry/cli builds would be skipped (broken image
  optim). Since `packageManager` pins pnpm 11, a settings-only workspace file is
  safe → committed `pnpm-workspace.yaml` (allowBuilds sharp + @sentry/cli),
  un-gitignored, removed both CI temp-write steps. Clean install verified.
- `docs/DEPLOY.md` written: deployable with zero env vars (stub Zara, inert
  Sentry/Analytics); each var lights up a feature. NEXT_PUBLIC_SENTRY_DSN is
  build-time (must be set before the deploy build).
- Gate: typecheck/lint/73 tests/knip/build green; e2e boot+fortune+api green on
  the Node runtime. Owed by Nick (all optional, non-blocking): ANTHROPIC_API_KEY,
  Sentry DSNs, Renovate app install.

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
