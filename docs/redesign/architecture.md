# iamnick.dev v2 — Architecture

> How the Dark Carnival is built. Companion to `PLAN.md` (what/why) and the ADRs (locked decisions). A fresh agent should be able to execute from this doc + the current codebase.

## Current foundation (reused)

Single pnpm Next.js 16 / React 19 app. Key existing pieces under `src/components/three/`: `JourneyCanvas.tsx` (dynamic `ssr:false` wrapper), `Scene.tsx` (Canvas, demand frameloop, dpr cap), `ScrollDriver.tsx` (native scroll → `useScrollStore` + `invalidate()`), `CameraRig.tsx` (CatmullRom spline driven by scroll progress), `journey.config.ts` (stop/camera tuning), `hooks/useQualityTier.ts`. Content is typed in `src/content/cv.ts`. Styling is Tailwind v4 `@theme` + CVA. Tests in Vitest. Deploys to Vercel.

These survive the redesign; the **scene content and visual design** change.

## Scene-state model (the spine)

A single explicit **scene mode** drives camera, scroll-lock, and input routing:

- `travelling` — default. Scroll moves the camera along the Midway spline. Attractions pass as the visitor scrolls. Input = scroll.
- `playing` — entered via **step-in** at a stall. Scroll is locked; pointer/touch drives the active game; a persistent **Exit/Skip** returns to `travelling` at the same scroll position.

Hold this in a small store (extend the existing scroll store, e.g. `useSceneStore`: `{ mode, activeStall, progress, sections }`). On-rails camera = scroll progress → spline position with cinematic "arrival" easing at each attraction (reuse `CameraRig` + `journey.config.ts`). No character controller / collision (ADR-0004).

## Content pipeline

- **Home content:** `src/content/cv.ts` (already typed: roles, side projects, skills, contact). Both the DOM and the 3D scene read from this single source (ADR-0003 — 3D never holds unique content).
- **Blog content:** `content/blog/*.mdx` with frontmatter (`title, date, description, tags`). Read at build (gray-matter for frontmatter), compiled via MDX, statically generated through `generateStaticParams` for `app/blog/[slug]`. Plain markdown works by default; MDX allows embedded components. Generate: per-post metadata, OG image (reuse `app/opengraph-image` ImageResponse approach), `Article`/`BlogPosting` JSON-LD, sitemap entries, RSS feed.

## Asset pipeline (Dark Carnival)

- **Source:** Synty "POLYGON Horror Carnival" pack, **neutral funfair assets only** (ADR-0005). Plus primitives + instanced neon for tins, bulb strings, signage.
- **Local location (acquired):** `~/Documents/Assets/` — use **`POLYGON_Horror_Carnival_SourceFiles_v3.zip`** (the FBX source) as the conversion input; `SourceFiles/MaterialList_PolygonHorrorCarnival.txt` lists materials. (Unity/Unreal packages also present but not used for R3F.) These live outside the repo — do **not** commit raw pack files.
- **Conversion:** ships FBX → convert to **GLB** (Blender export, or FBX2glTF) and compress (Draco/meshopt) before R3F use. Store converted GLBs in `public/models/carnival/` (replacing the retired cyberpunk GLBs). Convert/commit **only** the neutral funfair meshes — never the horror props.
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
- three.js stays code-split via `dynamic({ ssr: false })`; Rapier physics lazy-loads only on ball-toss step-in.
- Demand frameloop + `invalidate()` on scroll (existing) — GPU idle when still.
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
  components/
    three/                    # carnival scene (evolves existing; may rename journey→midway)
      attractions/            # role attractions, ball-toss, doodle-wall stall, etc.
      shared/                 # props, lights, neon materials, instanced bulbs
    organisms/                # DOM content sections (header, role, projects, contact)
    nav/                      # global header nav
    blog/                     # blog reading components
    doodle/                   # drawing UI (canvas), tile, wall
  content/
    cv.ts                     # home content (existing)
    blog/*.mdx                # blog posts
  lib/
    supabase/                 # client/server helpers
public/
  models/carnival/*.glb       # converted neutral Synty assets
  cv/nick-de-rozarieux-cv.pdf # CV download (Nick to provide)
content/blog/*.mdx            # (or under src/content/blog — pick one, keep consistent)
```

## Degradation contract (ADR-0003)

If WebGL is unavailable or `prefers-reduced-motion: reduce`: no canvas mounts; the page renders the full styled, readable DOM (header, all roles, projects, contact). The doodle wall still shows approved tiles as images; drawing may be hidden in reduced-motion. Nothing essential is lost.
