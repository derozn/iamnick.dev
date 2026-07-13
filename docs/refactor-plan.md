# Standards Refactoring Plan — iamnick.dev

> **Audience:** future maintainers, human or AI. Read alongside `CONTEXT.md` (domain
> glossary) and `docs/CODE_QUALITY_AUDIT.md` (July 2026 audit this plan builds on).
> Drafted July 2026 from the audit + three targeted architecture/API sweeps + a
> security review of the `feature/fortune-teller` diff. Decisions marked "Nick"
> were made explicitly by him — do not silently reverse them; supersede in writing.
> Stress-test this document with `/grill-with-docs` before executing.

## Why

The codebase accumulated three structural debts: a dormant parallel component
architecture (an abandoned v1 migration), a `content/` folder mixing five
unrelated concerns, and a hand-rolled API stack where industry-standard packages
now exist. `CODE_QUALITY_AUDIT.md` diagnosed most of it; this plan turns the
diagnosis plus fresh architecture findings into ordered, shippable phases.

**Security review (2026-07-11): no reportable vulnerabilities** in the
fortune-teller branch. One robustness item (uncaught `new URL(origin)` on a
malformed Origin header → 500 instead of 403, `src/app/api/fortune/route.ts:96`)
is fixed in Phase 4. API-key handling, XSS surface, input validation, and
server/client boundaries all verified clean.

**Key architecture findings (import-traced, re-verify before deleting):**

- The whole `organisms/` layer is dormant — 5 section components
  (`HeaderSection`, `RoleSection`, `EarlierRolesSection`, `SideProjectsSection`,
  `ContactSection`) are built, tested, exported, and never rendered. Live content
  flows through `StaticResume`'s inline sections. Deletion cascade: `MotionCard`,
  `SectionShell`, `atoms/Asset`, `atoms/Animation/Fade`, `ui-modules/next/image`
  serve only the dormant layer. Survivors: `JsonLd` (used by `layout.tsx`) and
  the font files.
- `src/modules/Interactive/Portrait/` is entirely dead (zero external importers).
  Storybook is not configured; both `.stories.tsx` files are dead weight.
- **Nick's decisions:** delete the dormant layer (don't revive); standardize on
  role-based component folders `ui/ overlays/ cv/ nav/ three/`.

## Execution model

Branch `chore/standards-refactor` off master after `feature/fortune-teller`
merges — that's the preference, not a hard gate. **Escape hatch (agreed
2026-07-13):** if the fortune-teller merge is still blocked on persona QA after
a few days, cut `chore/standards-refactor` from `feature/fortune-teller`
instead; Phases 1–3 don't touch persona wording. Only Phase 4 genuinely wants
the fortune route settled first. Each phase = one PR, independently shippable,
in order.

**Gate for every phase:**
`pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`, plus the headless
screenshot pass (`?debug=1` + `window.__sceneStore`) for anything scene-adjacent,
plus a grep for retired path segments. Re-verify every dead-code claim at
execution time — the repo moves fast.

---

## Phase 1 — Dead code purge (HIGH, mechanical)

- Retired three/ scene (audit §1): `CarnivalStreet`, `FirstPersonRig`,
  `carnival.config.ts`, `three/shared/{Ground,StringLights,SpaceDust,SceneLighting}`,
  `attractions/CarnivalProp`; `public/models/carnival/` (9.7 MB); superseded
  textures (`fog.png`, `noise.png`, `A/V/L/Y.png`). **Keep `effects/PostFX.tsx`**
  — live via `SafePostFX`.
- DOM cascade (verified zero live importers): all 5 section organisms +
  `MotionCard` + `SectionShell` + `ContactSection.test.tsx`; `atoms/Asset/`,
  `atoms/Animation/` (Fade + FadeItem), `atoms/TruncateText/` (+ snapshot dir),
  `ui-modules/next/image/`, both `.stories.tsx`; ALL of `src/modules/`;
  `src/hooks/{useOnScreen,useMedia}`.
- Remove the now-dead `'src/modules/Interactive/**'` glob from
  `eslint.config.mjs` (keep `src/components/three/**`).
- Store cleanup: strip vestigial `progress/sections/setProgress/setSections` from
  `src/store/scene.ts`; fix the scroll-era header comment. (`stepIn`/`exit` are
  KEPT — the audit suggested renaming them, but CONTEXT.md defines Step-in as
  canonical domain language; the glossary wins. Recorded 2026-07-13.)
- Docs: rewrite `README.md` + `docs/redesign/STATUS.md` around the iso Dark
  Carnival; add ADR-0007 superseding ADR-0004 (free-roam is the shipped design;
  ADR-0006 — taxonomy/organisms — was written during the grilling session).
- Done when: greps clean; knip (Phase 6 tool, run early here as verification)
  reports no orphans; gate green; repo ~10 MB lighter.

## Phase 2 — Component architecture migration (HIGH — the React/Next.js core)

Target tree (`git mv` everything to preserve history; sub-steps are sequential
because each touches `page.tsx`/`layout.tsx`):

```
src/components/
  ui/         (created lazily when the first real primitive lands — no empty dirs)
  overlays/   ContentOverlay, SectionContent, CareerTickets, FortunePanel(+test),
              IntroOverlay, AudioDirector, DebugBridge, TicketHud, BallTossHud,
              HighStrikerHud
  cv/         StaticCv (renamed from StaticResume), JsonLd   (server-only)
  nav/        SiteNav, MuteButton             (unchanged)
  three/      unchanged except HUDs leaving; configs stay
```

1. `content/*` → `overlays/`; update `page.tsx`.
2. HUDs out of the scene tree: `three/tickets/TicketHud.tsx`,
   `three/game/{BallTossHud,HighStrikerHud}.tsx` → `overlays/`; their three-free
   configs (`ticketConfig`, `highStrikerConfig`) stay in `three/`. Expect new
   lint findings as HUDs leave the `three/**` eslint override.
3. `cv/` (canonical term per CONTEXT.md — not "resume"): `StaticResume` →
   `StaticCv` + `organisms/JsonLd.tsx`; fonts →
   `src/lib/fonts/` (not components; `lib/` already hosts `cn`/`formatDate`).
   **Must rewrite `local.ts` relative `src:` paths** (`../../../../assets/…` →
   `../../assets/…`) — next/font resolves relative to the declaring file; the
   build gate catches this.
4. Docs sync: `docs/redesign/architecture.md` (organisms layer),
   `docs/redesign/hud-letterpress-overhaul.md` (fonts path); conventions below
   added to `CONTEXT.md`.

**Codified conventions:**

- Folders are roles, not atomic-design ranks (`Overlay`/`HUD`/`CV` are defined in CONTEXT.md). New component? Ask what it _does_.
- `ui/` only: folder-per-component + CVA `.styles.ts` + `index.ts`. Everywhere
  else: flat `.tsx` + colocated `.test.tsx`; no folder-level barrels.
- `cv/` is server-only (`'use client'` banned); may import `@/content/cv`
  directly.
- Client code gets data via props or `useSceneStore`. Documented exceptions:
  `SectionContent` + `CareerTickets` import cv (remediation would move the same
  bytes from JS bundle to RSC payload — not a win; per ADR-0003 the sr-only
  `StaticResume` already carries the content in HTML). **Enforced (agreed
  2026-07-13):** eslint `no-restricted-imports` on `@/content/cv` in
  `overlays|nav|three`, the two exceptions listed inline in `eslint.config.mjs`
  with a comment pointing here — new exceptions are a visible, reviewable act,
  not silent drift.
- `overlays/`/`nav/` may import from `three/` only three-free data modules; keep
  the "static bundle must not import `@react-three/*`" guard.
- RSC boundaries: independent client islands under a server `page.tsx` is the
  correct pattern for this app — assessed July 2026, no changes.

## Phase 3 — Config, dependency & secrets hygiene (HIGH, small)

- Pin all `"latest"` deps to caret ranges matching the current lockfile; upgrade
  deliberately thereafter (Renovate arrives in Phase 7).
- Move `pnpm.onlyBuiltDependencies` → `pnpm-workspace.yaml` (kills the pnpm 11
  warning; revisit the CI temp-workspace workaround at the same time).
- App Router cleanups: remove redundant `export const dynamic = 'auto'`
  (`layout.tsx`, `page.tsx`); remove the empty `<head />` in `layout.tsx`; one
  `SITE_URL` constant shared by `robots.ts`/`sitemap.ts`/`metadataBase`.
- **varlock secrets management** (`varlock` + `@varlock/nextjs-integration`,
  drop-in replacement for `@next/env`): replace `.env.example` with a committed
  **`.env.schema`** declaring every env var with decorators —
  `ANTHROPIC_API_KEY` (`@sensitive`, optional: absence = stub mode),
  `FORTUNE_STUB`, and slots for `UPSTASH_REDIS_REST_URL`/`TOKEN` (`@sensitive`)
  and `SENTRY_DSN`. Buys build-time validation, generated types, `@sensitive`
  log redaction, and build+runtime leak detection (its edge-runtime `Response`
  patching covers `/api/fortune` directly). Supersedes any zod-env idea — zod is
  for request bodies only. Caution: young tool (DMNO team) — pin the version;
  treat leak prevention as defense-in-depth (Vercel env vars remain the value
  store); verify no conflict with the CI pnpm workaround.

## Phase 4 — Fortune API modernization + a11y (MEDIUM)

One sub-PR each, in order:

1. **zod**: replace hand-rolled `isChatMessage`/`parseMessages` with a
   `ChatMessage`/body schema (`z.array(...).max(MAX_TURNS)`, content
   `max(1000)`, refine last-turn-is-user). Keep the 32KB body cap and origin
   check; add the try-catch around `new URL(origin)` → 403 (security-review
   robustness item); log the JSON-parse and stream catches instead of
   swallowing them.
2. **Vercel AI SDK**: swap `@anthropic-ai/sdk` → `ai` + `@ai-sdk/anthropic`;
   `streamText(...).toTextStreamResponse()` server-side (keeps the plain-text
   "first line = card name" protocol); `useChat` replaces `FortunePanel`'s
   hand-rolled `fetch`+`getReader` loop — **client MUST configure the AI SDK's
   text-stream transport** to match `toTextStreamResponse()`; the v5 default is
   the SSE UI-message protocol and will not parse a plain-text stream. Preserve: stub mode
   (no key / `FORTUNE_STUB=1` streams the canned reading), in-character 429s,
   abort-on-close, `MIST_REPLY` fallback. **Honest cost:** `route.test.ts` and
   `FortunePanel.test.tsx` mocks are rewritten against the AI SDK; card-split
   rendering is unchanged.
3. **@upstash/ratelimit + @upstash/redis** (DEFERRED 2026-07-13 — Nick to create the DB; in-memory limiter stays live meanwhile): real cross-instance sliding-window
   limiting (10/min/IP) + daily budget; falls back to the existing in-memory
   limiter when Upstash env vars are absent so dev/headless/CI need no account.
   Vars declared `@sensitive` in `.env.schema`. Requires Nick: free Upstash db.

Also in this phase:

- **focus-trap-react** for modal focus trap + restore (`ContentOverlay`, game
  HUD cards, `TicketHud` full-house) — the cheapest WCAG AA fix available.
- `FortunePanel`: `FORTUNE_ROUTE` constant; class-based opacity; note that
  `OPENERS` must track CV changes.
- Done when: malformed-Origin request → 403; zod rejects the same fixtures the
  old guards did (reuse existing test cases); stub mode still streams
  headlessly; Tab cycles inside open modals and focus restores on close; and a
  **real-key manual smoke on a deployed preview** (one live question + one
  forced mid-stream abort) — every automated test mocks the model, so this is
  the only guard on the unmocked path after the transport swap (agreed
  2026-07-13).

## Phase 5 — Deduplication & extraction (MEDIUM)

- Single homes (create module, migrate call sites, delete locals):
  `src/lib/motion.ts` (`EASE` ×8+), `synty/textures.ts` (emissive-atlas
  `useTexture` block ×3), `three/shaders/noise.ts` (GLSL `hash`/`vnoise` ×2),
  `synty/demoInstances.ts` (typed JSON cast ×4), one `applyEmissive`.
- `useDisposable()` hook → `LoaderVeil` (real per-visit GPU leak),
  `Atmosphere`, `GoldenTickets`, `ConfettiBurst`.
- Move `getGlowTexture` out of `synty/bulbGlowExtract` → `three/shared/`
  (natural home after the Phase 1 purge); extract Scene.tsx debug gates →
  `three/hooks/useDebugGates.ts`.
- Explicitly NOT: god-component splits (`BallTossGame`, `IsoControls`,
  `SectionContent`) — extract only when next touched; don't add a fourth concern.

## Phase 6 — Test suite & dev tooling (HIGH value)

Test pyramid — each layer tests only what the layer below can't:

- **Unit (Vitest)** — audit gaps, all pure/near-pure:
  `synty/conversion.ts#unityTRS` (an axis-flip regression silently scrambles the
  scene), `src/lib/audio.ts` (has `__resetAudioForTests`, no test),
  `ballTossConfig` helpers, `bulbGlowExtract` sampling, the Phase 4 zod schemas
  - rate-limit fallback selection. **No jsdom tests of R3F components — ever**
    (audit rule; the screenshot harness is their instrument).
- **Component (Vitest + testing-library, DOM only)**: `SiteNav` open/close +
  links match `ATTRACTIONS`; `ContentOverlay` focus trap + restore;
  `CareerTickets` keyboard stepping. `FortunePanel.test.tsx` sets the standard.
- **E2E (`@playwright/test`, chromium/swiftshader, new `e2e/` dir)** — absorbs
  and formalizes the `/tmp/shot` rig; `?debug=1` + `window.__sceneStore` stay
  load-bearing for deterministic states:
  - Boot smoke: load → intro overlay → enter → canvas mounts → HUD visible.
  - Content journeys: burger menu → each section panel opens, key CV facts present.
  - Fortune round-trip with `FORTUNE_STUB=1`: ask → streamed reading renders
    with card heading; rate-limited request shows in-character 429 copy.
  - API contract via Playwright request context: `/api/fortune` 400/403/413/429.
  - Profiles: Lite (mobile viewport + touch) smoke; reduced-motion emulation →
    no-canvas tier renders `StaticResume` content.
  - A11y: `@axe-core/playwright` sweep of DOM overlays — settles the audit's
    untested letterpress contrast question; keyboard assertions (Escape closes,
    Tab stays trapped).
  - Visual (split by surface, agreed 2026-07-13): **DOM overlays get full
    `toHaveScreenshot` pixel-diff** (deterministic browser rendering — diffs
    are real). **The canvas gets artifact screenshots per PR forever** plus
    programmatic sanity checks that don't depend on colour fidelity (canvas
    non-black, POI shots differ from each other, no full-frame smear) — per
    the audit, headless swiftshader colour is unreliable, so canvas pixel-diff
    would flake or lie; real-GPU eyeballs remain the final judge.
- **CI**: e2e job after build (`build → start → test`), uploading traces +
  screenshots on failure. Existing lint→typecheck→unit→build gate unchanged.
- **knip** (devDep; config modeled on the zzZac monorepo's): automates the
  dead-export detection Phases 1–2 did by hand; wire into a `pnpm validate`
  script + CI so orphans can't accumulate again.

## Phase 7 — Operational hardening (after Phases 1–6)

- **Sentry** (`@sentry/nextjs`, free tier): client + edge-route
  instrumentation; Phase 4's logged catches upgrade to
  `Sentry.captureException`. Low sampling (portfolio traffic); scrub request
  bodies — visitor questions are user content.
- **Renovate** (GitHub app + `renovate.json`): automated update PRs so Phase 3's
  pins don't fossilize; group the R3F ecosystem (`three`, `@react-three/*`) into
  one PR — they must move together.
- **Vercel Analytics** (`@vercel/analytics`): toggle + one component in
  `layout.tsx`; visit + vitals data for the job hunt.
- Requires Nick: Sentry account + DSN, Renovate app install, Analytics toggle.

## Out of scope (tracked follow-ons from the audit roadmap)

Atlas-dedup GLB re-export (~17 MB → ~2 MB, biggest user-facing win), keyboard
nav for scene/games, `synty/landmarks.ts` single source of world positions,
CSP + self-hosted draco, bundle-analyzer baseline, Lighthouse CI (considered,
rejected: threshold noise on a 3D-heavy site). **Evaluate a real visual
regression service** (Chromatic, Percy, Argos, Lost Pixel) once the Phase 6
suite exists — a service with a consistent rendering environment could make
canvas diffs meaningful where local swiftshader can't; adopt only if it
demonstrably beats the artifact-screenshot + real-GPU workflow. **TanStack
Hotkeys** (considered 2026-07-13, deferred — alpha, and the 2 trivial bindings
don't justify it; revisit as the `useKeyDown` upgrade path if a command palette,
richer shortcuts, or a shortcut-help panel land). Content bugs (bloom NaN
verification, ferris wheel spin, NPC tuning) are not standards work.

## Constraints

No R3F scene-internal/shader rewrites (organization + typing only). No tooling
replacement — ESLint 9 flat config with its R3F overrides, Tailwind v4, Vitest,
pnpm all stay. Respect the audit's "Conventions for the next agent" (GPU
contract, static bundle three-free, useMemo/ref lint rules, demand-frameloop
discipline).

**Approved dependency changes (Nick, 2026-07-11) — and no others.**
Runtime: `zod`, `ai` + `@ai-sdk/anthropic` (replacing `@anthropic-ai/sdk`),
`@upstash/ratelimit` + `@upstash/redis`, `focus-trap-react`, `@sentry/nextjs`,
`@vercel/analytics`, `varlock` + `@varlock/nextjs-integration` (pinned — young
tool). Dev: `knip`, `@playwright/test`, `@axe-core/playwright`; Renovate as a
GitHub app + `renovate.json`.
Rejected: `rate-limiter-flexible` (edge-incompatible — needs TCP Redis; its
memory mode adds nothing over the current limiter); Lighthouse CI.

## Verification

Per phase: the gate command; scene-adjacent phases add headless screenshots
(scene must be pixel-identical for Phases 1–2). Phase 4:
`curl -X POST -H 'Origin: not a url' https://localhost:3000/api/fortune` → 403.
Vitest globs (`src/**/*.test.{ts,tsx}`) and `test/setup.ts` are path-agnostic —
file moves are safe. Final: full-site smoke on a real GPU (headless swiftshader
color/fps is unreliable; audit conventions apply).
