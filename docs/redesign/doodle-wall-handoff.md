# Doodle Wall — Living Handoff

> **Mission:** build the **doodle wall** — the communal stall at the end of the Midway where
> any visitor draws a tile, it enters the pre-moderation queue, and once Nick approves it,
> it joins a bounded grid of the most-recent approved tiles. Full-feature (view + draw) on
> both Full and Lite. The site's first persistent backend (ADR-0001: Supabase).
>
> This is the **living** doc for the effort — maintained by the `carnival-context` agent
> (`.claude/agents/carnival-context.md`). Builders are briefed from it; outcomes are folded
> back in. Read `CONTEXT.md` first — its language is law.
>
> Branch: `feature/doodle-wall`. PRs target `master`.

---

## 0. TL;DR of what to do

Two stages, each its own PR:

1. **Stage 1 — visitor path:** Supabase schema (tiles + RLS + Storage), domain layer
   (`src/lib/doodle-wall/`), thin API routes (`POST /api/tiles`, `GET /api/wall`), the
   in-scene stall + approved-tile grid (`DoodleWall.tsx`), the drawing overlay
   (`DoodleWallHud.tsx`), store slice, attraction registration.
2. **Stage 2 — moderation:** `/admin` queue (Supabase Auth, Google OAuth, **hard
   allow-list of Nick's account only**), approve/reject route, daily keepalive cron.

Stage 1 progress: backend half ✅ done (contracts in §2.1); scene + overlay half is next
(§8 steps 4–5). All tuning parameters were fixed in the 2026-07-14 grill session (§5).

## 1. Current state (verified 2026-07-14, post-backend-slice)

- **Data + backend slice is DONE** (commits `58bf8ad`, `6d758dc`, `d28b50d`; gate green —
  typecheck/lint/test:ci 111 tests/build, keyless):
  - Domain layer `src/lib/doodle-wall/`: `types.ts`, `constants.ts` (server truths — see
    §2.1), `ports.ts`, `png.ts` (hand-parsed PNG validator), `submitterHash.ts`,
    `tileService.ts`, `fakes.ts` (in-memory adapters + programmatic PNG builder + 24
    seeded approved tiles), colocated tests.
  - Thin routes: `src/app/api/tiles/route.ts` (POST, + sibling `rateLimit.ts`, burst
    2/min/IP) and `src/app/api/wall/route.ts` (GET), mirroring fortune conventions.
  - Supabase adapters (dormant until provisioning): `src/lib/supabase/` —
    `serverClient.ts`, `tileRepository.ts`, `tileImageStore.ts`, `tileAdapters.ts`
    (selection factory + `resetTileAdapters()` + `DEV_SUBMITTER_HASH_SECRET`).
    supabase-js confined to that folder (grep-verified). Dep: `@supabase/supabase-js
^2.110.2`.
  - Migration `supabase/migrations/20260714115029_doodle_wall.sql`: tiles table, partial
    index (`created_at desc where status='approved'`), `(submitter_hash, created_at)`
    index, RLS anon insert-pending-only / select-approved-only, `tiles` bucket
    public-read with 128KB + image/png limits at bucket level.
  - `.env.schema`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
    `SUBMITTER_HASH_SECRET` — all `@sensitive @optional`; absent env = stub mode.
- **Nothing scene/overlay-side exists yet.** No `doodleWallConfig.ts`, no
  `DoodleWall.tsx`, no `DoodleWallHud.tsx`, no store slice, no attraction entry.
- **Binding decisions already made:** ADR-0001 (Supabase; pre-moderation queue; bounded
  recent-approved wall; no realtime; per-session/IP rate-limiting; keepalive cron; admin
  hard allow-list). Reaffirmed by Nick 2026-07-14 over a Vercel-native alternative.
- **The stall pattern to mirror** is ball-toss: config (`three/game/ballTossConfig.ts`,
  three-free) + in-Canvas game (`three/game/BallTossGame.tsx`) + DOM HUD
  (`overlays/BallTossHud.tsx`) + store summary slice (`src/store/scene.ts`) + attraction
  entry (`three/synty/attractions.ts`). See `ball-toss-game-handoff.md` §2 for the
  indicator → fly-in → `stepIn()` flow; it already works for `game:` sections.
- **The API pattern to mirror** is the fortune route (`src/app/api/fortune/route.ts`):
  Node runtime, zod validation, `rate-limiter-flexible` in-memory limiter, varlock-declared
  env (`.env.schema`), keyless stub mode for local dev.
- The site is live on Vercel; master is the deployed branch.

## 2. Architecture (binding)

**Loose hexagonal — Nick's rule: no mixing of concerns, no bloated files.**

```
src/app/api/*/route.ts        thin HTTP adapters: parse (zod) → rate-limit → call service → shape response
src/lib/doodle-wall/          domain: tile types, tileService (submit rules, bounded wall
                              query, moderation rules), ports (TileRepository, TileImageStore)
src/lib/supabase/             adapter: server/service-role clients + port implementations.
                              ONLY this folder imports supabase-js.
```

- Services are pure of HTTP and of Supabase; unit-test them against in-memory fakes.
- One interface per dependency direction, no further ceremony.
- Service-role key is server-only; never reaches the client bundle.
- RLS is the backstop, not the only enforcement: public may insert (status forced
  `pending`) and select `approved` only; status changes are admin-only.

**Skills builders MUST consult:** `supabase` (+ `supabase-postgres-best-practices` for
schema/query design) for any Supabase work; `security-best-practices` for any API surface;
the relevant `r3f-*` skill for canvas work; `building-components` for the drawing overlay.

### 2.1 Landed contracts (next slices build against these — do not renegotiate)

**Server truths** (`src/lib/doodle-wall/constants.ts` — re-export from
`doodleWallConfig.ts`, never redefine): `STORED_TILE_SIZE` 256, `DRAWING_CANVAS_SIZE`
512, `TILE_MAX_BYTES` 131072, `WALL_TILE_COUNT` 48, `SCENE_TILE_COUNT` 24,
`SUBMIT_BURST_PER_MINUTE` 2, `SUBMIT_DAILY_CAP` 10.

**`POST /api/tiles`** — body `{ "image": "<base64 PNG, no data: prefix>" }`, raw request
ceiling 204800 bytes. 201 → `{ id, status: 'pending', createdAt }` (ISO). Errors as
`{ error }` JSON: 400 `invalid-request` | `invalid-image`, 413 `too-large`, 429
`rate-limited` (burst AND daily cap share this token), 403 `bad-origin`.

**`GET /api/wall`** — 200 → `{ tiles: [{ id, imageUrl, createdAt }] }`, newest first,
≤48, `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. In stub mode
`imageUrl` is a `data:image/png;base64,` URI; with Supabase it is a Storage public URL —
**consumers must handle both**.

## 3. Feature spec (v1)

- **Wall (scenery):** a grid of the most-recent approved tiles rendered on the stall in the
  scene — textured planes fed from `GET /api/wall`. Visible to everyone while travelling.
- **Step-in (draw):** the stall's Play affordance steps in; a DOM overlay presents a square
  drawing surface (`<canvas>`), palette/brush/undo/clear, and Submit. Works with touch and
  pointer; full-feature on Full AND Lite (unlike ball-toss, no quality gate).
- **Submit:** PNG posted to `POST /api/tiles` → Storage upload + `pending` row. The visitor
  sees a "your tile is with the carny for approval" style confirmation — their tile does
  NOT appear on the wall yet.
- **Moderation (Stage 2):** Nick approves/rejects from `/admin` on his phone; approved
  tiles appear on next wall load. No realtime.
- **Degradation (ADR-0003):** no WebGL / reduced-motion → approved tiles render as plain
  `<img>` elements; drawing may be hidden. Nothing essential lost.

## 4. File map

| Piece                              | Path                                                                          | Stage | Status  |
| ---------------------------------- | ----------------------------------------------------------------------------- | ----- | ------- |
| SQL migration (tiles, RLS, bucket) | `supabase/migrations/20260714115029_doodle_wall.sql`                          | 1     | ✅ done |
| Domain: types, ports, service      | `src/lib/doodle-wall/`                                                        | 1     | ✅ done |
| Supabase clients + adapters        | `src/lib/supabase/` (dormant until provisioning)                              | 1     | ✅ done |
| Submit route (thin) + rate limiter | `src/app/api/tiles/route.ts` + `rateLimit.ts`                                 | 1     | ✅ done |
| Wall route (thin, cacheable)       | `src/app/api/wall/route.ts`                                                   | 1     | ✅ done |
| Env vars (4, all optional)         | `.env.schema` (SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY, SUBMITTER_HASH_SECRET) | 1     | ✅ done |
| Tuning config (three-free) + tests | `src/components/three/game/doodleWallConfig.ts`                               | 1     | next    |
| In-scene stall + tile grid         | `src/components/three/game/DoodleWall.tsx`                                    | 1     | next    |
| Drawing overlay                    | `src/components/overlays/DoodleWallHud.tsx`                                   | 1     | next    |
| Store slice                        | `src/store/scene.ts` (extend)                                                 | 1     | next    |
| Attraction entry                   | `src/components/three/synty/attractions.ts` (extend)                          | 1     | next    |
| Admin queue page                   | `src/app/admin/page.tsx`                                                      | 2     | —       |
| Approve/reject route               | `src/app/api/admin/tiles/[id]/route.ts`                                       | 2     | —       |
| Keepalive route + cron             | `src/app/api/keepalive/route.ts` + Vercel cron                                | 2     | —       |

## 5. Decisions

**Made:**

- Supabase backend — ADR-0001, reaffirmed by Nick 2026-07-14.
- Staged delivery, visitor path first — Nick, 2026-07-14.
- Loose hexagonal API architecture — Nick, 2026-07-14 (§2).
- Skills mandate (supabase / security-best-practices) — Nick, 2026-07-14 (§2).
- **Display surface** — in-scene tile grid as scenery; step-in opens a DOM overlay showing
  BOTH the approved wall (`<img>` grid) and the drawing surface. The overlay is also the
  wall's home on the no-canvas tier (linked from `StaticCv`), keeping the 3D grid purely
  decorative per ADR-0003 — grill session, Nick, 2026-07-14.
- **Wall bound + age-out** — `GET /api/wall` returns the newest 48 approved tiles; the
  in-scene grid renders the newest 24 (fixed 6×4); the overlay shows all 48. Age-out =
  falling out of the query; rows and PNGs are retained, not deleted — grill session, Nick,
  2026-07-14.
- **Tile size** — drawing canvas 512×512 internal, exported as 256×256 PNG; server rejects
  wrong dimensions or >128KB — grill session, Nick, 2026-07-14.
- **Drawing tools** — fixed near-black tile ground + ~6 neon inks drawn from the scene's
  existing bulb/neon hues; 3 brush sizes; undo (20 steps); clear. No eraser, no text tool
  — grill session, Nick, 2026-07-14.
- **Rate limiting + submitter_hash** — burst guard 2 submissions/min per IP in-memory
  (mirror `api/fortune/rateLimit.ts`); daily cap 10/day enforced durably by counting rows
  with the same `submitter_hash` in the last 24h. `submitter_hash` = HMAC-SHA256(IP,
  server secret from env) — stable for abuse tracing, no raw IP at rest — grill session,
  Nick, 2026-07-14. (Adds `SUBMITTER_HASH_SECRET` to `.env.schema`.)
- **Wall visual** — a Synty stall variant distinct from ball-toss's `Stall_02` (try
  `Stall_01`/`Stall_03`) housing a large flat board with the 6×4 tile grid; practical
  bulb string around the board via the existing `BulbGlow` system; thin emissive frame
  line per tile. Exact placement/offsets iterated visually; final look judged on Nick's
  Mac — grill session, Nick, 2026-07-14.

**Backend-slice deviations (accepted, now canon):**

- Routes return JSON `{ error }` bodies rather than fortune's plain text.
- No zod length cap on the base64 field — the raw request ceiling (204800B) + the
  service byte cap own size enforcement.
- Fake-adapter seed PNGs are generated programmatically, not embedded fixtures.

**Open:**

- Admin queue UX details (batch approve, preview size) — resolve at Stage 2 start.
- Exact stall placement on the Midway (after contact, per CONTEXT.md order) — iterate
  visually during the scene slice.

**Needs Nick (human gates):**

- **Provisioning gate (before real Supabase goes live):** create the Supabase project →
  run the migration (it also creates the `tiles` bucket) → set the four env vars (local
  - Vercel). Until then everything runs in stub mode. Note: Supabase env present but
    `SUBMITTER_HASH_SECRET` missing throws at request time — by design.
- Stage 2 admin allow-list uses Nick's actual Google identity — collect it at Stage 2
  start; never widen to "any Google login" (ADR-0001).
- Final look/feel judgement on his Mac (real GPU).

## 6. How to verify

- **Gate (every slice):** `pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`
  (currently 111 tests, keyless).
- **Domain + routes:** ✅ covered — `tileService`/`png`/`submitterHash` unit tests
  against fakes; route handler tests (rate-limit, 400s, approved-only wall). Config
  helpers go in `doodleWallConfig.test.ts` (scene slice).
- **Scene:** headless Playwright + swiftshader screenshots (recipe and iso-camera maths in
  `ball-toss-game-handoff.md` §6; drive state via `?debug=1` + `window.__sceneStore`).
  Check the wall grid renders and the overlay opens on step-in, on Full and Lite.
- **End-to-end (Supabase staging, after provisioning):** draw → submit → row is `pending`
  and NOT on the wall → approve → tile appears on next `/api/wall` load. Non-allow-listed
  Google account is denied `/admin`.
- **Degradation:** WebGL off → tiles render as `<img>`.

## 7. Gotchas (inherited — details in `ball-toss-game-handoff.md` §7)

- R3F lint rules: mutate refs only in `useFrame`/handlers; per-frame sim state in refs,
  only summaries in the store.
- Low tier runs `frameloop='demand'` — call `invalidate()` while anything animates.
- No EffectComposer/bloom additions; emissive + `BulbGlow` sprites only.
- Spawned GLB props rendering black → `material.vertexColors = false`.
- Never `rm -rf .next` while a dev server runs; clean prod build for verification.
- No `@react-three/*` imports in the static bundle; overlays may import three-free config
  modules only (`doodleWallConfig.ts` must stay three-free).
- Tile PNGs are user content: treat as untrusted (validate server-side, cap dimensions and
  bytes, re-encode or content-type-pin on serve; no SVG).
- `pnpm knip` flags `DRAWING_CANVAS_SIZE`/`SCENE_TILE_COUNT` until the scene/overlay
  slice consumes them — expected, resolves itself.
- `GET /api/wall` `imageUrl` is a data URI in stub mode, an https Storage URL with
  Supabase — scene textures and overlay `<img>`s must handle both.
- Nick's dev server usually holds port 3000 — smoke servers go on a spare port (backend
  slice used 3100).
- Commit messages end `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## 8. Build order

1. ~~Grill session closes §5 open decisions~~ ✅ done 2026-07-14; outcomes in §5.
2. ~~Domain layer + fake adapters + unit tests~~ ✅ done (`58bf8ad`); server truths in
   `src/lib/doodle-wall/constants.ts`, to be re-exported by `doodleWallConfig.ts`.
3. ~~Routes (thin) against the fake adapter; stub mode; Supabase adapters dormant~~ ✅
   done (`6d758dc`); contracts in §2.1.
4. Scene: attraction entry + stall + wall grid fed by `/api/wall` (stub data).
5. Overlay: drawing surface + submit flow + store slice.
6. Swap in real Supabase adapter behind the ports once Nick provisions (gate).
7. Close-out: glossary-guard → /code-review (high) → docs-scribe → absorb here.
8. Stage 2: admin + keepalive, same shape.

## 9. What just happened

2026-07-14 — **Stage 1 data + backend slice landed** (`58bf8ad` domain layer, `6d758dc`
routes/adapters/migration/env, `d28b50d` comment reword). Gate green (111 tests,
keyless); supabase-js confinement grep-verified; smoke-tested on port 3100. Route
contracts and server truths recorded in §2.1; accepted deviations in §5. Earlier the
same day: branch cut from `9360f16`, `carnival-context` agent created, doc seeded, grill
session closed all open parameters. Next: the scene + overlay slice (§8 steps 4–5), then
the Supabase provisioning gate (Needs Nick).
