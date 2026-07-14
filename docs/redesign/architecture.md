# iamnick.dev v2 — Architecture

> How the Dark Carnival is built. Companion to `PLAN.md` (what/why) and the ADRs (locked decisions). A fresh agent should be able to execute from this doc + the current codebase.

## Current foundation (reused)

Single pnpm Next.js 16 / React 19 app. Key pieces under `src/components/three/`: `MidwayCanvas.tsx` (dynamic `ssr:false` wrapper), `Scene.tsx` (the persistent R3F canvas — frameloop `always` on the high tier, `demand` on low; dpr capped), `synty/` (the Unity→three translation layer, plus `IsoControls.tsx` for the camera), `hooks/useQualityTier.ts`. Content is typed in `src/content/cv.ts`. Styling is Tailwind v4 `@theme`. Tests in Vitest. Deploys to Vercel.

(The scroll-era pieces this section once listed — `JourneyCanvas`, `ScrollDriver`, `CameraRig`, `journey.config.ts` — were deleted in refactor Phase 1; the on-rails design they served was superseded by free-roam, ADR-0007.)

## Scene-state model (the spine)

A single explicit **scene mode** (`useSceneStore`) drives camera and input routing:

- `travelling` — default. The visitor drags/zooms the fixed isometric camera around the Midway; attractions are scenery (free-roam superseded the on-rails spline, ADR-0007).
- `viewing` — a content overlay is open; the camera is parked on the attraction.
- `playing` — entered via **step-in** at a stall. Pointer/touch drives the active game; a persistent **Exit** returns to `travelling`.

No character controller / collision.

## Content pipeline

- **Home content:** `src/content/cv.ts` (already typed: roles, side projects, skills, contact). Both the DOM and the 3D scene read from this single source (ADR-0003 — 3D never holds unique content).
- **Blog content:** `content/blog/*.mdx` with frontmatter (`title, date, description, tags`). Read at build (gray-matter for frontmatter), compiled via MDX, statically generated through `generateStaticParams` for `app/blog/[slug]`. Plain markdown works by default; MDX allows embedded components. Generate: per-post metadata, OG image (reuse `app/opengraph-image` ImageResponse approach), `Article`/`BlogPosting` JSON-LD, sitemap entries, RSS feed.

## Asset pipeline (Dark Carnival)

- **Source:** Synty "POLYGON Horror Carnival" pack, **neutral funfair assets only** (ADR-0005). Plus primitives + instanced neon for tins, bulb strings, signage.
- **Local location (acquired):** `~/Documents/Assets/` — use **`POLYGON_Horror_Carnival_SourceFiles_v3.zip`** (the FBX source) as the conversion input; `SourceFiles/MaterialList_PolygonHorrorCarnival.txt` lists materials. (Unity/Unreal packages also present but not used for R3F.) These live outside the repo — do **not** commit raw pack files.
- **Conversion:** ships FBX → convert to **GLB** (Blender export, or FBX2glTF) and compress (Draco/meshopt) before R3F use. Converted GLBs live in `public/models/synty/` (props/structures) and `public/models/npcs/` (rigged characters). Convert/commit **only** the neutral funfair meshes — never the horror props.
- **Unify:** apply the existing neon emissive material + bloom across all props so sourced assets + primitives read as one world.
- **Guardrail:** no horror prop is ever converted/placed. Licence: confirm Synty permits WebGL embedding; never expose raw pack meshes for download.

## Doodle wall backend (Supabase) — ADR-0001

Stage 1 (the visitor path) is **shipped** as a hexagonal slice: routes →
domain service/ports → adapters. Stage 2 (admin moderation + keepalive) is
not built, and the Supabase project is not yet provisioned — both routes run
in **stub mode** against in-memory fakes until it is.

**Layout (shipped)**

- **Routes** (`src/app/api/`) — thin HTTP adapters over the service:
  - `POST /api/tiles` (`api/tiles/route.ts`) — body `{ image: <base64 PNG> }`
    (zod, unknown keys stripped); same-site Origin check, raw-body ceiling,
    in-memory burst guard (`api/tiles/rateLimit.ts`, 2/min per IP), then
    `tileService.submitTile`. 201 `{ id, status: 'pending', createdAt }`.
  - `GET /api/wall` (`api/wall/route.ts`) — the newest ≤48 approved tiles,
    CDN-cacheable (`s-maxage=60`), already projected to the public `WallTile`
    shape (`{ id, imageUrl, createdAt }` — no `imagePath`, no
    `submitterHash`; the projection is applied at the domain boundary).
- **Domain** (`src/lib/doodle-wall/`) — pure of HTTP and of Supabase:
  `tileService.ts` (every acceptance rule: PNG signature + exact 256×256 via
  `png.ts`, 128 KB byte cap, forced-`pending` status, durable daily cap of 10
  per submitter hash counted through the repository), `ports.ts`
  (`TileRepository`, `TileImageStore` — the latter with `remove()` as the
  compensation path when the row insert fails after the upload), `types.ts`
  (`Tile` + the public `WallTile` projection), `constants.ts` (the server
  truths — re-exported by `three/game/doodleWallConfig.ts` so scene and
  overlay can never drift from what the server accepts), `submitterHash.ts`
  (HMAC-SHA256 of the IP under a server secret — no raw IPs at rest) and
  `fakes.ts` (in-memory adapters plus a programmatic PNG builder seeding the
  stub wall and test fixtures).
- **Adapters** (`src/lib/supabase/`) — dormant until provisioning.
  `tileAdapters.ts` is the single selection point (akin to `FORTUNE_STUB`):
  with any of the three Supabase vars absent both routes use the fakes; a
  **partially** set env in production throws rather than silently serving
  fakes. `serverClient.ts` builds the service-role client (server-only —
  only this folder may import `@supabase/supabase-js`);
  `tileRepository.ts` / `tileImageStore.ts` implement the ports.
- **Env** (`.env.schema`): `SUPABASE_URL`, `SUPABASE_ANON_KEY` (unused by
  this slice — declared for Stage 2 admin auth, but still gates stub mode),
  `SUPABASE_SERVICE_ROLE_KEY`, and `SUBMITTER_HASH_SECRET` (required once the
  Supabase env is set; a fixed dev constant stands in for stub mode only).

**Storage & data** (`supabase/migrations/20260714115029_doodle_wall.sql` —
reviewed-only, applied at provisioning, never run in CI)

- `public.tiles`: `id`, `image_path`, `status`
  (`pending | approved | rejected`), `submitter_hash`, `created_at`,
  `approved_at` (null until Stage 2 approves). Partial index for the wall
  query; a `(submitter_hash, created_at)` index for the daily-cap count.
- Storage bucket `tiles`: public read; content type (`image/png`) and the
  128 KB cap pinned on the bucket as defence in depth.
- **RLS is the backstop, not the write path:** anon may `select` approved
  tiles only, and there is **no anon insert policy** — every write goes
  through the service role (which bypasses RLS), so a leaked anon key can
  neither read the queue nor flood it past `tileService`'s checks. The
  service enforces every rule first.

**Stage 2 (not built)**

- `POST /api/admin/tiles/:id` — approve/reject; **auth-gated to Nick's Google account** (allow-list his email, not "any Google login").
- **Admin view:** a protected `/admin` route using Supabase Auth (Google OAuth) showing the pending queue with one-tap approve/reject (phone-friendly).
- **Keepalive:** Supabase free projects pause after ~1 week idle → a free daily cron (GitHub Action or Vercel cron) pings the DB so the wall is never asleep.

**No realtime** — new approved tiles appear on next load/poll.

## Quality tiers / profiles

Extend `useQualityTier` (`high|low|none`) → **Full** (high), **Lite** (low), **fallback** (none). Tier controls: DPR cap, bloom/post-fx on/off, light count, prop detail, dust count. Interactive ball-toss additionally requires `pointer: fine`. `none` (reduced-motion / no-WebGL) renders the **content-first DOM** with no canvas — fully readable.

## Rendering & performance

- Canvas mounts **only on `/`** (home). Blog/content routes never load three.js (ADR-0002).
- three.js stays code-split via `dynamic({ ssr: false })`. (The shipped ball-toss sim is a hand-rolled per-frame integrator — no physics engine loads.)
- Frameloop: `always` on the high tier (rides/NPCs animate continuously); `demand` + `invalidate()` on low — GPU idle when still.
- LCP = server-rendered `<h1>`; canvas is `position: fixed` behind flowing DOM (CLS ~0).

## Proposed file/dir map (additions/changes)

```
src/
  app/
    page.tsx                  # carnival home (Midway + DOM content)
    blog/page.tsx             # blog index (future)
    blog/[slug]/page.tsx      # post (SSG, no canvas) (future)
    admin/page.tsx            # moderation queue (Supabase Google OAuth) (Stage 2, not built)
    api/tiles/route.ts        # submit tile (shipped; rateLimit.ts alongside)
    api/wall/route.ts         # fetch approved wall (shipped)
    api/admin/tiles/[id]/route.ts  # approve/reject (auth) (Stage 2, not built)
    rss.xml/route.ts          # RSS feed (future)
  components/                 # role-based folders (see Component conventions below)
    three/                    # canvas-side scene: Scene, MidwayCanvas, synty/ (Unity→three
                              #   translation layer), game/ + tickets/ (sims + configs),
                              #   effects/, intro/, hooks/
    overlays/                 # DOM over the canvas: ContentOverlay + section panels,
                              #   game HUDs, IntroOverlay, AudioDirector, DebugBridge
    cv/                       # server-only CV document: StaticCv, JsonLd
    nav/                      # global nav: SiteNav, MuteButton
    ui/                       # (reserved) shared primitives — none exist yet
    blog/                     # blog reading components (future)
                              # (doodle wall UI has no folder of its own: the board is
                              #   three/game/DoodleWall.tsx, the step-in overlay is
                              #   overlays/DoodleWallHud.tsx — role-based, as above)
  content/
    cv.ts                     # home content (existing)
    blog/*.mdx                # blog posts
  lib/
    fonts/                    # next/font setup: local.ts (Montserrat, Open Sans),
                              #   google.ts (Rye, IM Fell — letterpress HUD faces)
    doodle-wall/              # doodle wall domain: tileService, ports, types,
                              #   constants, png, submitterHash, fakes
    supabase/                 # doodle wall adapters: tileAdapters (selection +
                              #   stub gate), serverClient, tileRepository, tileImageStore
supabase/
  migrations/*.sql            # reviewed-only DDL, applied at provisioning (not in CI)
public/
  models/synty/*.glb          # converted neutral Synty assets
  models/npcs/*.glb           # NPC rigs (character + baked animation)
  cv/nick-de-rozarieux-cv.pdf # CV download
content/blog/*.mdx            # (or under src/content/blog — pick one, keep consistent)
```

## Component conventions (refactor Phase 2, codified)

Locked during the standards refactor (`docs/refactor-plan.md`, Phase 2).

- **Folders are roles, not atomic-design ranks** — `ui/ overlays/ cv/ nav/
three/`, with Overlay/HUD/CV meaning what `CONTEXT.md` defines. Placing a
  new component is a question of what it _does_.
- **`ui/` only:** folder-per-component with a CVA `.styles.ts` and an
  `index.ts`. **Everywhere else:** flat `.tsx` with a colocated `.test.tsx`;
  no folder-level barrels.
- **`cv/` is server-only** — `'use client'` is banned there; it may import
  `@/content/cv` directly.
- **Client code gets data via props or `useSceneStore`.** Enforced: eslint
  `no-restricted-imports` bans `@/content/cv` in `overlays/`, `nav/` and
  `three/`. The two documented exceptions — `SectionContent` and
  `CareerTickets` — are listed inline in `eslint.config.mjs`; remediation
  would only move the same bytes from the JS bundle to the RSC payload, and
  per ADR-0003 the sr-only `StaticCv` already carries the content as HTML.
  Adding an exception is a visible, reviewable act, not silent drift.
- **`overlays/` and `nav/` may import from `three/` only three-free data
  modules** (`attractions.ts`, the game/ticket configs) — the "static bundle
  must not import `@react-three/*`" rule holds for everything outside
  `three/`.
- **RSC boundary:** independent client islands mounted under a server
  `page.tsx` — assessed July 2026 as the right pattern for this app; no
  changes planned.

## Degradation contract (ADR-0003)

If WebGL is unavailable or `prefers-reduced-motion: reduce`: no canvas mounts; the page renders the full styled, readable DOM (header, all roles, projects, contact). The doodle wall stays fully usable: `StaticCv`'s `#doodle-wall` link opens the same `DoodleWallHud` overlay (wall view + drawing surface, tiles as plain `<img>`s) — the hash is routed through `stepIn()`, no canvas required. Nothing essential is lost.
