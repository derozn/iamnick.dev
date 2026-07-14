# Dark Carnival — build status & handoff

> **Start here for a new session.** What the shipped scene is, how it's built,
> how to verify a change, and what's in flight. Companions: `CONTEXT.md`
> (glossary — use its language), `docs/refactor-plan.md` (the standards
> refactor, complete and merged), `docs/CODE_QUALITY_AUDIT.md` (July 2026
> audit), the ADRs (locked decisions), and `scene-map-guide.md` (authoring
> NPC/walker placements).

## Where we are

The homepage is an **isometric, drag-to-explore Dark Carnival** — a faithful
translation of the Synty "POLYGON Horror Carnival" demo scene, navigated
Bruno-Simon-style: a fixed iso camera the visitor pans and zooms, with floating
indicators over each attraction; clicking one flies the camera in and opens
that attraction's content overlay. The earlier first-person on-rails walk
(ADR-0004) was reversed in the iso pivot; free-roam is the shipped design.

Live on top of the scene: three playable stalls — ball-toss, high-striker,
and the doodle wall (Stage 1, the visitor path: view + draw on Full and Lite;
its API runs in stub mode until Supabase is provisioned) — a golden-ticket
hunt, Madame Zara's fortune wagon (`/api/fortune`, Anthropic-backed with a
keyless stub mode), a letterpress-carnival HUD language, and Full/Lite quality
tiers plus a no-canvas tier — under `prefers-reduced-motion` the sr-only
`StaticCv` (the CV as DOM) becomes the visible page (ADR-0003), where the
doodle wall stays reachable via its `#doodle-wall` anchor.

## Scene architecture (files)

Entry chain — `src/app/page.tsx` mounts client islands over a server page:

- **`src/components/three/MidwayCanvas.tsx`** — `dynamic(ssr:false)` shell,
  fixed full-viewport at `z-0`. `hooks/useQualityTier` gates `high`/`low`
  (Full/Lite) /`none` (reduced-motion / no WebGL → no canvas at all).
- **`src/components/three/Scene.tsx`** — the single persistent R3F canvas:
  exp² fog + ACES tone mapping, `SyntyScene`, `AnimatedRides`, `BulbGlow`,
  `DynamicLights`, `Npcs`, `Atmosphere`, `GoldenTickets`, both game sims,
  `DoodleWall` (the stall's tile board),
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
- **`synty/attractions.ts`** — **the single source of truth for POIs.** Nine
  attractions: `intro`, `about`, `work`, `projects`, `contact`,
  `high-striker`, `fortune`, `ball-toss`, `doodle-wall`. Each carries its
  prefab, authored
  Unity transform, world-centre `position` (indicator anchor + camera focus
  target), `facing` and `focusDist`. Indicators, camera fly-ins, SiteNav links
  and overlay routing all derive from this array.
- **`synty/IsoControls.tsx`** — camera + gestures: fixed iso angle (225°
  azimuth, ~53° tilt), drag-to-pan (viewport-relative sensitivity, gentler on
  touch), scroll/pinch zoom (clamped), and the fly-in/return easing when
  `focusedAttraction` changes.
- **Games** — `three/game/BallTossGame.tsx` (slingshot pull-back throw, tuning
  in `ballTossConfig.ts`), `three/game/HighStrikerGame.tsx`
  (`highStrikerConfig.ts`) and `three/game/DoodleWall.tsx` (the doodle wall's
  board at the end of the Midway — the newest approved tiles from `/api/wall`
  as a 6×4 grid; layout/tools tuning in `doodleWallConfig.ts`, a three-free
  module that re-exports the server truths from `lib/doodle-wall/constants.ts`);
  `three/tickets/GoldenTickets.tsx` for the hunt.

## Overlay layer (DOM over the canvas)

Everything DOM-over-canvas lives in `src/components/overlays/` (flat `.tsx`,
tests colocated, no barrels — the Phase 2 conventions in
`docs/redesign/architecture.md`):

- **`overlays/ContentOverlay.tsx`** — the panel that rises over the dimmed
  carnival in `viewing` mode; backdrop click / ✕ / Escape close it. Routes by
  attraction `section`: **`SectionContent.tsx`** renders the CV panels
  (letterpress styling, data from `content/cv.ts`), `chat:fortune` renders
  **`FortunePanel.tsx`** (streams Readings from `/api/fortune`), and the
  career attraction opens **`CareerTickets.tsx`** (the ticket deck) on its
  own stage.
- **Game HUDs** — `overlays/BallTossHud.tsx`, `overlays/HighStrikerHud.tsx`,
  `overlays/DoodleWallHud.tsx` and `overlays/TicketHud.tsx`: DOM overlays
  mounted from `page.tsx`. Their tuning configs stay canvas-side
  (`three/game/ballTossConfig.ts`, `three/game/highStrikerConfig.ts`,
  `three/game/doodleWallConfig.ts`, `three/tickets/ticketConfig.ts`).
  `DoodleWallHud` is the doodle wall's step-in overlay — the approved-tile
  wall view plus the drawing surface (512×512 canvas exported as a 256×256
  PNG to `POST /api/tiles`), with the carny fronting the pre-moderation queue
  in its copy. It opens on step-in on both Full and Lite, and `StaticCv`'s
  `#doodle-wall` hash link is routed through `stepIn()` too, so the no-canvas
  tier reaches the same overlay.
- **`IntroOverlay`, `AudioDirector`, `DebugBridge`** (`overlays/`) — entry
  vignette, scene-state→audio mixer, and the headless-verification hook.
- **`src/components/cv/`** — server-only: `StaticCv.tsx` (the sr-only CV
  document, visible page under reduced motion) and `JsonLd.tsx`.
- **`src/components/nav/SiteNav.tsx`** — burger menu (mounted in
  `layout.tsx`), links built from `ATTRACTIONS`; content attractions open in
  place, stalls route through the camera fly-in. Plus `MuteButton`.

An eslint `no-restricted-imports` rule bans `@/content/cv` from client code
(`overlays/`, `nav/`, `three/`); the two documented exceptions
(`SectionContent`, `CareerTickets`) are listed inline in `eslint.config.mjs`.

## Store

**`src/store/scene.ts`** (`useSceneStore`, zustand, SSR-safe). One explicit
`mode` drives camera and input routing:

- `travelling` — default; drag/zoom the Midway, attractions are scenery.
- `viewing` — a content overlay is open, camera parked on the attraction.
- `playing` — stepped into a stall; input drives the game until `exit()`.

Plus: intro/veil progress flags, `focusedAttraction`/`activeAttraction`/
`activeStall`, persisted `postFxBlocked`/`muted`/ticket progress, summary
slices for both games (the physics lives in refs; only HUD-facing summaries hit
the store), and the doodle wall's `doodleWallPhase`
(`intro | drawing | submitting | submitted | error`, reset to `intro` on
step-in). Per-frame consumers read imperatively via
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
- `?off=synty,rides,glow,lights,atmo,postfx,game,doodle,tickets,npcs,indicators`
  and `?offp=<regex>` — Scene.tsx bisection gates for unmounting
  pieces/prefabs (`doodle` unmounts the doodle wall board on its own; `game`
  covers the ball-toss and high-striker sims).
- `?bloom=0` — force the composer off for A/B comparison.

Headless swiftshader colour/fps is unreliable — real-GPU eyeballs remain the
final judge for grading changes.

## What just happened

**Doodle wall, Stage 1 — the visitor path** (`feature/doodle-wall`,
2026-07-14). The communal stall now closes the Midway. A hexagonal slice:
domain layer in `src/lib/doodle-wall/` (`tileService` holding every acceptance
rule, ports, PNG header validation, HMAC submitter hashing, in-memory fakes),
dormant Supabase adapters in `src/lib/supabase/` (`tileAdapters.ts` is the
single selection point — a fully keyless env is stub mode against the fakes;
a _partially_ set Supabase env in production throws instead of silently
serving fakes), `POST /api/tiles` + `GET /api/wall`, a reviewed-only migration
(`supabase/migrations/20260714115029_doodle_wall.sql` — anon may read approved
tiles only; there is **no anon insert policy**, every write goes through the
service role), four new `.env.schema` vars, the in-scene board
(`three/game/DoodleWall.tsx`), the `DoodleWallHud` step-in overlay and the
`doodle-wall` attraction plus `StaticCv`'s `#doodle-wall` anchor. **Stage 2 —
the admin moderation view and the keepalive cron — is not built**, and the
Supabase project is not yet provisioned: both routes run in stub mode
everywhere.

Before that, the **standards refactor** completed and merged to master
(PRs #60–64; `docs/refactor-plan.md` is now historical). Its Phase 2 still
shapes the tree: role-based component folders (`components/content/` →
`overlays/`, game HUDs out of the three tree, `cv/` for the server-only CV
document, `StaticResume` renamed `StaticCv`), fonts in
`src/lib/fonts/{local,google}.ts`, the eslint cv-import ban, and the
conventions codified in `docs/redesign/architecture.md`.

## What's next

- **Supabase provisioning** (Nick) — create the project, apply
  `supabase/migrations/20260714115029_doodle_wall.sql`, set `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `SUBMITTER_HASH_SECRET`
  in Vercel; `getTileAdapters()` leaves stub mode on its own once all three
  Supabase vars are present.
- **Doodle wall, Stage 2** — the admin moderation view over the
  pre-moderation queue (Supabase Auth Google OAuth, hard allow-listed to
  Nick's account) with approve/reject, plus the free daily keepalive cron
  (ADR-0001).
- **Keyboard navigation** for scene and games (carried over from the July
  2026 audit — `IsoControls` is still pointer/touch only).
