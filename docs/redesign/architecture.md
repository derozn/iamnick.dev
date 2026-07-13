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

**Storage & data**

- Supabase **Storage** bucket holds each tile's small PNG (~256×256).
- Supabase **Postgres** `tiles` table: `id`, `image_path`, `status` (`pending | approved | rejected`), `created_at`, `submitter_hash` (for rate-limit), maybe `approved_at`. Bounded display = query most-recent N `approved`.
- **RLS:** public can `insert` (status forced `pending`) and `select` only `approved`; only the admin (Nick's Google identity) can update status.

**Endpoints (Next.js Route Handlers, `app/api/...`)**

- `POST /api/tiles` — accepts a drawing, stores PNG + `pending` row; rate-limited per `submitter_hash`/IP.
- `GET /api/wall` — returns the most-recent N approved tiles (cacheable).
- `POST /api/admin/tiles/:id` — approve/reject; **auth-gated to Nick's Google account** (allow-list his email, not "any Google login").

**Admin view:** a protected `/admin` route using Supabase Auth (Google OAuth) showing the pending queue with one-tap approve/reject (phone-friendly).

**No realtime** — new approved tiles appear on next load/poll.

**Keepalive:** Supabase free projects pause after ~1 week idle → a free daily cron (GitHub Action or Vercel cron) pings the DB so the wall is never asleep.

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
    blog/page.tsx             # blog index
    blog/[slug]/page.tsx      # post (SSG, no canvas)
    admin/page.tsx            # moderation queue (Supabase Google OAuth)
    api/tiles/route.ts        # submit tile
    api/wall/route.ts         # fetch approved wall
    api/admin/tiles/[id]/route.ts  # approve/reject (auth)
    rss.xml/route.ts          # RSS feed
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
    doodle/                   # drawing UI (canvas), tile, wall (future)
  content/
    cv.ts                     # home content (existing)
    blog/*.mdx                # blog posts
  lib/
    fonts/                    # next/font setup: local.ts (Montserrat, Open Sans),
                              #   google.ts (Rye, IM Fell — letterpress HUD faces)
    supabase/                 # client/server helpers (future)
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

If WebGL is unavailable or `prefers-reduced-motion: reduce`: no canvas mounts; the page renders the full styled, readable DOM (header, all roles, projects, contact). The doodle wall still shows approved tiles as images; drawing may be hidden in reduced-motion. Nothing essential is lost.
