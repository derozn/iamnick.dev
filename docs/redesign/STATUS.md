# Dark Carnival — build status & handoff

> **Start here for a new session.** What the shipped scene is, how it's built,
> how to verify a change, and what's in flight. Companions: `CONTEXT.md`
> (glossary — use its language), `docs/refactor-plan.md` (the standards refactor
> now executing), `docs/CODE_QUALITY_AUDIT.md` (July 2026 audit), the ADRs
> (locked decisions), and `scene-map-guide.md` (authoring NPC/walker placements).

## Where we are

The homepage is an **isometric, drag-to-explore Dark Carnival** — a faithful
translation of the Synty "POLYGON Horror Carnival" demo scene, navigated
Bruno-Simon-style: a fixed iso camera the visitor pans and zooms, with floating
indicators over each attraction; clicking one flies the camera in and opens
that attraction's content overlay. The earlier first-person on-rails walk
(ADR-0004) was reversed in the iso pivot; free-roam is the shipped design.

Live on top of the scene: two playable stalls (ball-toss, high-striker), a
golden-ticket hunt, Madame Zara's fortune wagon (`/api/fortune`,
Anthropic-backed with a keyless stub mode), a letterpress-carnival HUD
language, and Full/Lite quality tiers plus a no-canvas tier — under
`prefers-reduced-motion` the sr-only `StaticResume` (the CV as DOM) becomes the
visible page (ADR-0003).

## Scene architecture (files)

Entry chain — `src/app/page.tsx` mounts client islands over a server page:

- **`src/components/three/MidwayCanvas.tsx`** — `dynamic(ssr:false)` shell,
  fixed full-viewport at `z-0`. `hooks/useQualityTier` gates `high`/`low`
  (Full/Lite) /`none` (reduced-motion / no WebGL → no canvas at all).
- **`src/components/three/Scene.tsx`** — the single persistent R3F canvas:
  exp² fog + ACES tone mapping, `SyntyScene`, `AnimatedRides`, `BulbGlow`,
  `DynamicLights`, `Npcs`, `Atmosphere`, `GoldenTickets`, both games,
  `LoaderVeil` (shader loading veil) and `SafePostFX` (bloom, mounted only
  after the veil dissolves; a persisted context-loss tripwire can disable it
  per-device). Header comments in the file explain the bloom/veil ordering and
  the historical NaN black-frame fix.
- **`src/components/three/synty/`** — the Unity→three translation layer.
  `conversion.ts` (`unityTRS`: Z-flip position, quaternion handedness — the
  convention everything sits on), `InstancedPrefab` (instanced GLBs, shared
  base atlas, normal sanitising), `SyntyScene` (renders
  `demo-instances.json` + `manifest.json` + `sceneAdditions.ts`, with exclusion
  filters for translation artefacts).
- **`synty/attractions.ts`** — **the single source of truth for POIs.** Eight
  attractions: `intro`, `about`, `work`, `projects`, `contact`,
  `high-striker`, `fortune`, `ball-toss`. Each carries its prefab, authored
  Unity transform, world-centre `position` (indicator anchor + camera focus
  target), `facing` and `focusDist`. Indicators, camera fly-ins, SiteNav links
  and overlay routing all derive from this array.
- **`synty/IsoControls.tsx`** — camera + gestures: fixed iso angle (225°
  azimuth, ~53° tilt), drag-to-pan (viewport-relative sensitivity, gentler on
  touch), scroll/pinch zoom (clamped), and the fly-in/return easing when
  `focusedAttraction` changes.
- **Games** — `three/game/BallTossGame.tsx` (slingshot pull-back throw, tuning
  in `ballTossConfig.ts`) and `three/game/HighStrikerGame.tsx`
  (`highStrikerConfig.ts`); `three/tickets/GoldenTickets.tsx` for the hunt.

## Overlay layer (DOM over the canvas)

- **`src/components/content/ContentOverlay.tsx`** — the panel that rises over
  the dimmed carnival in `viewing` mode; backdrop click / ✕ / Escape close it.
  Routes by attraction `section`: **`SectionContent.tsx`** renders the CV
  panels (letterpress styling, data from `content/cv.ts`), `chat:fortune`
  renders **`FortunePanel.tsx`** (streams Readings from `/api/fortune`), and
  the career attraction opens **`CareerTickets.tsx`** (the ticket deck) on its
  own stage.
- **Game HUDs** — `BallTossHud`, `HighStrikerHud` (`three/game/`) and
  `TicketHud` (`three/tickets/`): DOM overlays mounted from `page.tsx`.
- **`IntroOverlay`, `AudioDirector`, `DebugBridge`** (`components/content/`) —
  entry vignette, scene-state→audio mixer, and the headless-verification hook.
- **`src/components/nav/SiteNav.tsx`** — burger menu (mounted in
  `layout.tsx`), links built from `ATTRACTIONS`; content attractions open in
  place, stalls route through the camera fly-in. Plus `MuteButton`.

Phase 2 of the refactor moves these into role-based folders
(`overlays/ cv/ nav/ three/`) — check `docs/refactor-plan.md` before adding
components.

## Store

**`src/store/scene.ts`** (`useSceneStore`, zustand, SSR-safe). One explicit
`mode` drives camera and input routing:

- `travelling` — default; drag/zoom the Midway, attractions are scenery.
- `viewing` — a content overlay is open, camera parked on the attraction.
- `playing` — stepped into a stall; input drives the game until `exit()`.

Plus: intro/veil progress flags, `focusedAttraction`/`activeAttraction`/
`activeStall`, persisted `postFxBlocked`/`muted`/ticket progress, and summary
slices for both games (the physics lives in refs; only HUD-facing summaries hit
the store). Per-frame consumers read imperatively via
`useSceneStore.getState()` inside `useFrame` so updates never re-render React.

## How to verify a change

Quality gate (CI runs the same):

```
pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build
```

Scene changes additionally need headless screenshots — no green build proves
the carnival renders:

```
pnpm build && pnpm start        # never build while a dev server holds .next
node /tmp/shot/<scenario>.mjs   # Playwright chromium + swiftshader
# then Read the PNGs in /tmp/shot/
```

The rig is a set of scenario scripts in `/tmp/shot/` (e.g. `npcs.mjs`,
`fortune-panel.mjs`) — **uncommitted and outside CI**; refactor Phase 6
formalises it into a versioned `@playwright/test` e2e suite. Deterministic
states come from the debug hooks, all inert without `?debug=1`:

- `window.__sceneStore` (via `DebugBridge`) — drive the store directly:
  `__sceneStore.getState().start()`, `.focus('fortune')`, etc.
- `?off=synty,rides,glow,lights,game,indicators` and `?offp=<regex>` — Scene.tsx
  bisection gates for unmounting pieces/prefabs.
- `?bloom=0` — force the composer off for A/B comparison.

Headless swiftshader colour/fps is unreliable — real-GPU eyeballs remain the
final judge for grading changes.

## What just happened

**Refactor Phase 1 — dead-code purge** (branch `chore/standards-refactor`, see
`docs/refactor-plan.md` + `docs/refactor-state.md` for live status). The
retired first-person scene that previous versions of this document described —
`CarnivalStreet`, `FirstPersonRig`, `carnival.config.ts`, the `three/shared/`
pieces, `public/models/carnival/` (9.7 MB) — is deleted, along with the dormant
organisms/section-component layer (`StaticResume`'s inline sections carry the
live content; `JsonLd` survives). The store lost its vestigial scroll-era
fields. ADR-0004 (on-rails spine) no longer matches shipped reality and is
superseded in writing as part of this phase.

## What's next (refactor Phases 2–7, one line each)

2. **Component architecture** — role-based folders (`ui/ overlays/ cv/ nav/ three/`); HUDs leave the three tree; `StaticResume` → `StaticCv`.
3. **Config/deps/secrets** — pin the `"latest"` deps, varlock `.env.schema`, App Router cleanups.
4. **Fortune API + a11y** — zod body schema, Vercel AI SDK transport, Upstash rate limiting, modal focus traps.
5. **Dedup & extraction** — single homes for `EASE`/atlas-texture/GLSL-noise duplicates, `useDisposable()`.
6. **Tests & tooling** — unit gaps (`unityTRS`, audio), Playwright e2e absorbing the `/tmp/shot` rig, knip in CI.
7. **Ops hardening** — Sentry, Renovate, Vercel Analytics.

Beyond the refactor (tracked in the audit/plan, not standards work): the Synty
atlas dedup (~17 MB → ~2 MB model payload — the biggest user-facing win),
keyboard navigation for scene and games, and Madame Zara persona QA before the
fortune-teller branch merges.
