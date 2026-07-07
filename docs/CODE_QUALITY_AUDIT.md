# Code Quality Audit — iamnick.dev

> **Audience:** future maintainers, human or AI. Read this alongside `CONTEXT.md`
> (the domain glossary — still the most reliable doc in the repo). Audited July
> 2026 on `feature/carnival-personality` by a two-agent sweep (architecture +
> engineering practice), findings verified by hand where cheap. File paths were
> correct at audit time; re-verify before acting on any single line.

## Executive summary

The codebase is **better than its owner fears but worse than it looks from a
green CI run**. The strong parts are genuinely strong: a strict TypeScript +
ESLint 9 flat-config setup with custom react-hooks immutability rules and _zero_
`eslint-disable` comments, a lean SSR-safe zustand store, correct code-splitting
of the three.js chunk, a real reduced-motion/no-canvas tier, and an sr-only
crawlable résumé that gives the SEO story real substance.

The weak parts cluster into five themes, in priority order:

1. **A parallel dead codebase is still on disk** — the retired first-person
   scene (8 components + 9.7 MB of models) sits next to the live iso scene and
   actively misleads readers; the top-level docs (README, STATUS.md, ADR-0004)
   describe that _retired_ architecture as current.
2. **Visual verification is manual and unversioned** — the Playwright/
   swiftshader screenshot rig that every scene change depends on lives in
   `/tmp`, outside the repo and CI. Every green build is "typecheck passed",
   not "the carnival renders".
3. **Asset payload is ~10× larger than necessary** — 255 Synty GLBs each embed
   their own copy of the same texture atlas (~17 MB total; a shared external
   atlas would land near 2 MB), plus the 9.7 MB orphaned model folder.
4. **Accessibility of the interactive layer** — the DOM HUDs are solid (aria,
   Escape, reduced-motion), but the 3D scene and both games are pointer-only,
   and modals neither trap nor restore focus.
5. **Fragile dependency policy** — every major dependency is pinned to
   `"latest"`; a lockfile regeneration is an uncontrolled full-stack upgrade.

None of these block a deploy today (see the deploy checklist in the PR/handback
notes), but items 1–3 compound: every future session pays the dead-code and
missing-verification tax again.

---

## 1. Dead code & documentation drift (HIGH)

**Verified orphans** (no imports from live code — grep-verified):

| Path                                                                                               | What it is                                                                         |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/components/three/CarnivalStreet.tsx`                                                          | retired hand-built scene renderer                                                  |
| `src/components/three/FirstPersonRig.tsx`                                                          | retired scroll-rail camera                                                         |
| `src/components/three/carnival.config.ts`                                                          | retired scene layout data                                                          |
| `src/components/three/shared/Ground.tsx`, `StringLights.tsx`, `SpaceDust.tsx`, `SceneLighting.tsx` | retired scene pieces                                                               |
| `src/components/three/attractions/CarnivalProp.tsx`                                                | retired GLB normaliser                                                             |
| `public/models/carnival/` (**9.7 MB**)                                                             | models only the retired scene used                                                 |
| `public/textures/fog.png`, `noise.png`, `A/V/L/Y.png`                                              | superseded / never referenced                                                      |
| `src/components/three/effects/PostFX.tsx`                                                          | _not_ dead — mounted via `SafePostFX`; listed here because agents keep flagging it |

**Vestigial store state:** `progress`, `sections`, `setProgress`, `setSections`
in `src/store/scene.ts` have **no consumers** (the ScrollDriver that wrote them
was deleted in the iso pivot; the store's header comment still describes the
scroll-era model). `stepIn`/`exit` naming ("travelling" mode) is also
scroll-era vocabulary that no longer matches the iso interaction.

**Docs describing the retired architecture as current:**

- `README.md` — says "scroll-driven 3D journey … cyberpunk cityscape". Wrong on
  both counts; the site is an isometric drag-to-explore Dark Carnival.
- `docs/redesign/STATUS.md` — the designated "start here" doc describes the
  first-person on-rails walk, `carnival.config.ts` as the tuning surface, and
  scroll-driven verification. All retired.
- `docs/adr/0004-on-rails-spine-freeroam-parked.md` — locks a decision that was
  explicitly reversed (free-roam is now the shipped design). Needs a
  superseding ADR, not silent deletion.
- `CONTEXT.md` — **accurate**; keep it as the entry point and keep it honest.

**Recommendation (one focused PR):** delete the orphan tree + `public/models/
carnival/` + unused textures, strip the vestigial store slice, rewrite
README/STATUS.md around the iso scene, add ADR-0006 superseding ADR-0004.
This is mechanical, low-risk, and pays for itself in every future session.
_Caveat:_ re-grep each file at deletion time; this branch moves fast.

## 2. Verification & CI (HIGH)

- CI (`.github/workflows/ci.yml`) gates lint → typecheck → test → build on PR
  and push. Good. But **nothing in CI looks at a rendered frame**, and the only
  tool that does — the Playwright/swiftshader screenshot rig — lives in
  `/tmp/shot/shot.mjs`, uncommitted. It has already been lost and rebuilt once.
- **Fix first:** move the rig into `scripts/verify/` (runner + the store-driven
  scenario: load → enter → overview → focus each POI → screenshot), then add a
  CI job: build → start → screenshots → upload as artifacts. Even without
  pixel-diffing, artifact screenshots on every PR turn "looks right on my
  machine" into a reviewable record. Pixel-diff regression testing can come
  later.
- The `?debug=1` + `off=`/`offp=` bisection gates in `Scene.tsx` and the
  `window.__sceneStore` bridge are load-bearing for this — keep them, but see
  §5 for extracting them out of production component code.
- 35 Vitest tests cover the store, pure config math (`meterValue`,
  `resultLabel`), data validation (`cv.ts`), and DOM hooks. That's the right
  _kind_ of coverage for a canvas-heavy app, but the misses are notable:
  `src/lib/audio.ts` (has a `__resetAudioForTests` export and no test file),
  `synty/conversion.ts` `unityTRS` (the coordinate convention EVERYTHING
  depends on — one axis-flip regression would scramble the scene silently),
  `ballTossConfig` helpers, and `bulbGlowExtract` sampling. All are pure or
  near-pure: cheap, high-value unit tests.
- Don't attempt jsdom tests of R3F components; the screenshot harness is the
  correct instrument for them.

## 3. Performance & payload (HIGH value, known shape)

- **The atlas dedup is the single biggest lever in the repo**: ~255 GLBs in
  `public/models/synty/` each embed a copy of the same base atlas → ~17 MB on
  disk/network and (pre-dedup-at-runtime) VRAM pressure. Runtime already
  force-shares one `base-atlas.png` (`InstancedPrefab.applyBase`), so the
  _download_ is the remaining waste: re-exporting GLBs with textures stripped
  (or a build-time `gltf-transform` pass) should land the model payload near
  2 MB. Watch UV flipY/colorSpace and the `SHARE_SKIP` sign/poster exceptions.
- `useGLTF.preload` fires for ~250 GLBs at module load — the browser queues
  them fine, but consider prioritising the entrance-visible prefabs so the
  intro vignette is ready sooner; the loader now shows honest progress either
  way.
- Draco decoding uses drei's default CDN WASM. Self-host under `public/draco/`
  to remove a third-party runtime dependency (also simplifies any future CSP).
- No bundle analyzer is configured; first-load JS is unmeasured. Add
  `@next/bundle-analyzer` and record a baseline in this doc.
- The GPU-fragility rules that the code enforces implicitly — dpr cap
  `[1,1.25]`, no MSAA, pooled point lights, shared atlas, no composer by
  default — are documented only in scattered comments and session memory.
  They belong in a short `docs/PERFORMANCE_CONTRACT.md` so no future change
  violates them unknowingly.

## 4. Accessibility (HIGH for hiring-site credibility)

Strengths: sr-only `StaticResume` as the real crawlable content; JSON-LD;
`aria-hidden` canvas wrapper; Escape closes everything; reduced-motion tier
skips the canvas entirely; HUD buttons carry labels/`aria-pressed`.

Gaps, in order:

1. **No focus trap / focus restoration** in any modal (`ContentOverlay`,
   game HUD cards, `TicketHud` full-house). Tab escapes into the page behind;
   focus is dropped on close. This is the cheapest WCAG AA fix available.
2. **The scene and games are pointer-only.** No keyboard pan/zoom in
   `IsoControls`, no keyboard route into games (the burger menu _can_ open
   content panels, which saves the content story — but ball-toss and striker
   are unplayable without a pointer; striker is one `keydown` listener away
   from playable, since it's a single-tap game).
3. Letterpress palette contrast is untested (brass-on-bone small caps are the
   likely offenders). Run axe/contrast tooling once and record results.
4. Note: `robots.ts` and `sitemap.ts` **exist** as app-router handlers — an
   earlier audit pass wrongly reported them missing because it looked in
   `public/`. Both are fine.

## 5. Architecture & code health (MEDIUM — lots of small paper cuts)

**What's coherent:** feature-folder layout under `components/three/`
(`synty/` scene translation, `game/`, `tickets/`, `effects/`, `intro/`),
config-as-data files colocated with consumers, an _implicit but consistent_
convention that config files (`ticketConfig`, `highStrikerConfig`) are
three-free so DOM HUDs can import them, and the store never imports components.

**Paper cuts worth fixing (roughly in order of value):**

- **Undisposed GPU resources.** `LoaderVeil` (unmounts after the reveal!),
  `Atmosphere`, `GoldenTickets`, `ConfettiBurst` create geometries/materials in
  `useMemo` with no `dispose()` cleanup. Most are long-lived so the leak is
  small, but LoaderVeil's ShaderMaterial + PlaneGeometry genuinely leak every
  visit. Add a shared `useDisposable(() => new …)` hook and use it everywhere.
- **Duplication.** `EASE = [0.22, 0.61, 0.27, 1]` is declared in ~8 HUD files;
  `applyEmissive` exists in both `InstancedPrefab` and `AnimatedRides`; the
  emissive-atlas `useTexture` config block is repeated in `SyntyScene`,
  `AnimatedRides`, `BulbGlow`; the GLSL `hash`/`vnoise` pair is duplicated in
  `LoaderVeil` and `Atmosphere`; `demo-instances.json` is re-cast to
  `Record<string, number[][]>` in four files. Each wants a single home
  (`src/lib/motion.ts`, `synty/textures.ts`, `three/shaders/noise.ts`,
  `synty/demoInstances.ts`).
- **No single source of truth for world landmarks.** Positions for the same
  places are hardcoded independently in `attractions.ts`, `ticketConfig.ts`,
  `DynamicLights.tsx` (candidate lights), `Atmosphere.tsx` (fog sheets),
  `sceneAdditions.ts`, and `IsoControls.tsx` (intro/overview targets). Moving
  one structure means a scavenger hunt. Introduce `synty/landmarks.ts` that
  names the world positions once and let everything derive.
- **God components.** `BallTossGame.tsx` (~540 lines: physics, input, assets,
  scoring) and `IsoControls.tsx` (~230 lines: gestures, camera easing, intro,
  focus fly-in) each mix 3–4 concerns. Extract `useSlingshotInput` /
  `useBottlePhysics` and `useIsoGestures` when next touched — don't refactor
  speculatively, but don't add a fourth concern to either file.
- **Cross-boundary reach:** `tickets/` and `game/` import `getGlowTexture`
  from `synty/bulbGlowExtract` — a shared halo texture shouldn't live inside
  the Synty translation layer. Move it to `three/shared/` (currently a
  dead-code folder; after the §1 purge it becomes the natural home).
- **Debug gates inline in `Scene.tsx`.** Useful (see §2) but ~20 lines of
  URL-parsing in the production scene root. Extract to
  `three/hooks/useDebugGates.ts` returning the same shape.
- **Store shape.** One god-store with three de-facto slices (`ballTossX`
  prefix, `strikerX` prefix, tickets) and inconsistent verb pairs
  (`open/close` vs `stepIn/exit`). Fine at this size — but adopt zustand slice
  files if one more feature lands, and rename the scroll-era vocabulary while
  deleting the vestigial fields (§1).
- **Type quality** is genuinely good (strict mode, no `any`, no non-null
  assertions in src). Remaining casts cluster around drei's `useTexture`
  callback typing and JSON imports — both solvable with tiny typed wrapper
  helpers. Consider `noUncheckedIndexedAccess` (expect a day of index-guard
  fallout in the instancing code).

## 6. Dependencies & config hygiene (MEDIUM)

- **Every runtime dep is `"latest"`** in `package.json`. The lockfile pins
  reality (`next@16.2.9`, `react@19.2.7`, `three@0.184.0`…), but any lockfile
  regeneration = simultaneous major upgrades of the entire stack, and three.js
  minor bumps routinely break R3F ecosystems. Pin to caret ranges matching the
  current lockfile and upgrade deliberately.
- The `pnpm.onlyBuiltDependencies` key in `package.json` is ignored by pnpm 11
  and prints a warning on **every** command; move it to `pnpm-workspace.yaml`
  per the warning link (the CI's temp-workspace-file workaround should be
  revisited at the same time).
- `next.config.ts` ships HSTS/nosniff/frame headers but **no CSP**. With fonts
  via `next/font`, the draco CDN, and zero inline scripts, a strict CSP is
  achievable — do it after self-hosting draco (§3) so the allowlist stays
  trivial.

## 7. Known scene-correctness debt (tracked, not new)

Carried over from session memory so it doesn't get lost — these are content
bugs, not code-quality items: the bloom NaN fix awaits real-GPU verification
(bloom is `?bloom=1` opt-in until then — see `iamnick-bloom-nan-blackout`
memory / Scene.tsx comment); a handful of props still carry wrong textures
(haunted-house bricks need a pack Nick doesn't own; photo-stand board); the
ferris wheel can't spin (merged mesh, needs a geometry split at conversion);
NPC placements/yaws are untuned until the Mixamo pass lands.

---

## Prioritised roadmap

**Quick wins (do in the next working session, ~half a day total):**

1. Dead-code + docs purge (§1) — one PR, mechanical.
2. Commit the screenshot rig into `scripts/verify/` (§2).
3. Pin dependency versions; move the pnpm key; kill the install warning (§6).
4. `EASE` / noise-GLSL / `applyEmissive` / atlas-config dedup (§5).
5. Disposal hook for LoaderVeil + friends (§5).
6. Focus trap + restore in modals (§4).

**Projects (schedule deliberately):**

7. Atlas dedup re-export of the Synty GLBs (§3) — biggest user-facing win.
8. Screenshot job in CI with artifact upload (§2).
9. Keyboard navigation: arrows/± in IsoControls; keydown play for striker (§4).
10. `landmarks.ts` single source of world positions (§5).
11. Unit tests for `unityTRS`, audio lib, ballToss helpers (§2).
12. CSP + self-hosted draco (§3/§6).
13. Bundle analyzer baseline (§3).

## Conventions for the next agent (read before writing code)

These rules are enforced by lint or hard-won debugging; violating them costs
hours:

- **Never mutate a `useMemo` return or read a ref during render** — the custom
  react-hooks rules block it. Build ShaderMaterials with inline uniforms in
  `useMemo`; mutate uniforms in `useFrame` _through an element ref_.
- **Style the canvas via CSS** (`.midway-canvas canvas` in globals.css), never
  by assigning to `gl.domElement`.
- **Static bundle must not import `@react-three/*`** — anything mounted in
  `page.tsx`/`layout.tsx` (HUDs, nav, overlays) may only import three-free
  modules (that's why `ticketConfig`/`highStrikerConfig` are three-free).
- **Don't subscribe to drei's `useProgress` with the hook** — loaders register
  synchronously during other components' render; sample
  `useProgress.getState()` inside `useFrame` instead.
- **Respect the GPU contract**: dpr ≤ 1.25, no MSAA, no new always-on lights
  (add candidates to the DynamicLights pool), share textures, no post-fx
  without the SafePostFX guard, `computeVertexNormals` requires the
  zero-normal sanitiser (NaN normals + bloom = full black frame).
- **Demand-frameloop discipline (low tier)**: anything that animates must
  `invalidate()` while it's animating and go quiet when idle.
- **Verification**: `pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`
  (never while a dev server holds `.next`), then the headless screenshot pass
  with `?debug=1` + `window.__sceneStore` to drive deterministic states.
  Headless swiftshader colour/fps is unreliable — final look judgements happen
  on a real GPU.
