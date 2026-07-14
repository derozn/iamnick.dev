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

1. **Stage 1 — visitor path:** ✅ **complete — [PR #65](https://github.com/derozn/iamnick.dev/pull/65)
   MERGED to master** (`12d4a39`, 2026-07-14). Supabase is **provisioned and migrated**
   (§1) but the routes still run stub mode: the four env vars are unset. **Blocked on
   Nick:** merge the small storage-listing PR (§5), set the four env vars (`.env.local`
   - Vercel, all four together), then the stub→real end-to-end check (§6).
2. **Stage 2 — moderation:** `/admin` queue (Supabase Auth, Google OAuth, **hard
   allow-list of Nick's account only**), approve/reject route, daily keepalive cron.
   **Do not start** until the env vars are set, the end-to-end check passes, and Nick
   supplies his Google identity.

## 1. Current state (verified 2026-07-14, post-merge + provisioning, master `12d4a39`)

**Stage 1 is merged and the Supabase project exists.** Gate green at `c43bf60`
(typecheck / lint / test:ci, 120 tests keyless / build); CI green on the PR through
merge.

- **Backend** (`58bf8ad`, `6d758dc`): domain layer `src/lib/doodle-wall/` (`types.ts` —
  now also home of the public `WallTile` shape — `constants.ts`, `ports.ts`, `png.ts`,
  `submitterHash.ts`, `tileService.ts`, `fakes.ts`, colocated tests); thin routes
  `src/app/api/tiles/route.ts` (+ sibling `rateLimit.ts`, burst 2/min/IP) and
  `src/app/api/wall/route.ts`; Supabase adapters in `src/lib/supabase/` (dormant until
  the env vars are set; supabase-js confined there, grep-verified; `TileImageStore` now has
  `remove()` for insert-failure compensation). Migration
  `supabase/migrations/20260714115029_doodle_wall.sql`: tiles table + indexes, RLS
  **select-approved-only — the anon INSERT policy was dropped** (every legitimate write
  goes through the service role), `tiles` bucket public-read with 128KB + image/png
  bucket-level limits. `.env.schema`: 4 vars, all `@sensitive @optional`; absent env =
  stub mode, **partial Supabase env in production throws** (tripwire in the adapter
  factory).
- **Scene** (`f06f27a`, `20ecc3c`, `bc376a7`, revised `4860738`):
  `three/game/doodleWallConfig.ts` (three-free; re-exports server truths and
  `WallTile`; own tests) and `three/game/DoodleWall.tsx` — a **freestanding**
  bulb-strung 6×4 tile-grid board on poles in the NE fence corner at three
  **(17.5, 39)**, fed by `GET /api/wall`. **No stall prefab** — the Stall_03 first
  placed at (12.5, 36.8) sat inside the big tree canopy there and read as "inside a
  tent" (Nick). Attraction entry `doodle-wall` (section `game:doodle-wall`) in
  `synty/attractions.ts`; `Attraction.prefab` is now optional (unconsumed metadata) and
  absent for this entry. Own bisection key `?off=doodle` (`?off=game` again means only
  the game sims).
- **Overlay + store** (`c600659`, `c902fa5`): `overlays/DoodleWallHud.tsx` — step-in
  overlay showing the approved wall (`<img>` grid) plus the 512→256 drawing surface
  (palette / 3 brushes / undo 20 / clear) and submit. Store slice in `src/store/scene.ts`:
  `doodleWallPhase` (`intro | drawing | submitting | submitted | error`) +
  `setDoodleWallPhase`; `stepIn('doodle-wall')` resets the phase atomically.
  `#doodle-wall` hash-open routes through `stepIn()` so mode-keyed chrome (burger,
  ticket tally) yields correctly; `StaticCv` links to a server-rendered
  `id="doodle-wall"` target for the no-canvas tier.
- **Merged:** PR #65 → master `12d4a39` (2026-07-14). Close-out chain (`5a2df8d`
  glossary-guard, `c43bf60` review fixes), docs sync (`b4bc279`) and the board-only
  revision (`4860738`) are all in.
- **Supabase provisioned (this session, via the CLI):** project **iamnick**, ref
  `hzwjezozoxlopyfgmxoc`, Central EU (Frankfurt), created 2026-07-14. `supabase link` +
  `supabase db push` applied `20260714115029_doodle_wall.sql`; `supabase migration
list` shows local/remote in sync. Verified on the remote: `public.tiles` exists with
  RLS enabled and exactly one policy ("anon reads approved tiles only", SELECT to
  anon); `tiles` bucket public, 131072 file-size limit, image/png only.
- **Storage-listing fix (security follow-up, applied remotely):**
  `supabase/migrations/20260714203433_drop_tiles_listing_policy.sql` drops the
  "public read of tile images" SELECT policy on `storage.objects`. Advisor
  `0025_public_bucket_allows_listing`: on a public bucket that policy's only effect
  was letting anon LIST the bucket — enumerating pending/rejected tile PNGs (uploaded
  before the pre-moderation queue's verdict). Public object URLs are unaffected
  (public buckets serve by URL without any `storage.objects` policy; all server access
  is service role). `supabase db advisors --linked` now reports "No issues found". In
  the repo the migration sits on `fix/doodle-wall-storage-listing` (uncommitted at
  absorb time) — a small PR is the next step.
- **Still stub mode everywhere:** the four env vars are unset (local and Vercel), so
  both routes serve fakes. The stub→real end-to-end check (§6) has not run. Key
  formats when Nick sets them: §5 provisioning canon.
- Supabase MCP server configured in `.mcp.json` (untracked), pointed at the project
  ref; not yet OAuth-connected in-session — the CLI is the working path.

## 2. Architecture (binding)

**Loose hexagonal — Nick's rule: no mixing of concerns, no bloated files.**

```
src/app/api/*/route.ts        thin HTTP adapters: parse (zod) → rate-limit → call service → shape response
src/lib/doodle-wall/          domain: tile types (incl. public WallTile), tileService (submit
                              rules, bounded wall query, moderation rules), ports
                              (TileRepository, TileImageStore)
src/lib/supabase/             adapter: server/service-role clients + port implementations.
                              ONLY this folder imports supabase-js.
```

- Services are pure of HTTP and of Supabase; unit-test them against in-memory fakes.
- One interface per dependency direction, no further ceremony.
- Service-role key is server-only; never reaches the client bundle.
- RLS is the backstop, not the only enforcement: anon may **select approved only**;
  all writes (insert as `pending`, status changes) go through the service role.

**Skills builders MUST consult:** `supabase` (+ `supabase-postgres-best-practices` for
schema/query design) for any Supabase work; `security-best-practices` for any API surface;
the relevant `r3f-*` skill for canvas work; `building-components` for overlay work.

### 2.1 Landed contracts (Stage 2 builds against these — do not renegotiate)

**Server truths** (`src/lib/doodle-wall/constants.ts` — re-exported by
`doodleWallConfig.ts`, never redefined): `STORED_TILE_SIZE` 256, `DRAWING_CANVAS_SIZE`
512, `TILE_MAX_BYTES` 131072, `WALL_TILE_COUNT` 48, `SCENE_TILE_COUNT` 24,
`SUBMIT_BURST_PER_MINUTE` 2, `SUBMIT_DAILY_CAP` 10.

**`POST /api/tiles`** — body `{ "image": "<base64 PNG, no data: prefix>" }`, raw request
ceiling 204800 bytes, byte-accurate (`Buffer.byteLength`) with a Content-Length
pre-check before buffering. 201 → `{ id, status: 'pending', createdAt }` (ISO). Errors
as `{ error }` JSON: 400 `invalid-request` | `invalid-image`, 413 `too-large`, 429
`rate-limited` (burst AND daily cap share this token), 403 `bad-origin`.

**`GET /api/wall`** — 200 → `{ tiles: WallTile[] }` where `WallTile` =
`{ id, imageUrl, createdAt }` (`src/lib/doodle-wall/types.ts` — the domain's
`getWall()` projects to this public shape; `submitterHash`/`imagePath` never cross the
boundary). Newest first, ≤48, `Cache-Control: public, s-maxage=60,
stale-while-revalidate=300`. In stub mode `imageUrl` is a `data:image/png;base64,` URI;
with Supabase it is a Storage public URL — **consumers must handle both**.

## 3. Feature spec (v1)

- **Wall (scenery):** a 6×4 grid of the newest 24 approved tiles on the stall's board in
  the scene, fed from `GET /api/wall`. Visible to everyone while travelling.
- **Step-in (draw):** the stall's Play affordance (or the `#doodle-wall` hash, routed
  through `stepIn()`) opens the overlay: the full 48-tile approved wall as an `<img>`
  grid plus a square drawing surface, palette/brush/undo/clear, Submit. Touch and
  pointer; full-feature on Full AND Lite (no quality gate).
- **Submit:** PNG posted to `POST /api/tiles` → Storage upload + `pending` row. The
  visitor sees a "your tile is with the carny" confirmation — the tile does NOT appear
  on the wall yet. Deterministic rejections (too-large, 400/403) get their own error
  cards, distinct from transient failures with Try again.
- **Moderation (Stage 2):** Nick approves/rejects from `/admin` on his phone; approved
  tiles appear on next wall load. No realtime.
- **Degradation (ADR-0003):** no WebGL / reduced-motion → `StaticCv` links to the
  overlay via `#doodle-wall`; approved tiles render as plain `<img>` elements. Nothing
  essential lost.

## 4. File map

| Piece                              | Path                                                                          | Stage | Status                          |
| ---------------------------------- | ----------------------------------------------------------------------------- | ----- | ------------------------------- |
| SQL migration (tiles, RLS, bucket) | `supabase/migrations/20260714115029_doodle_wall.sql`                          | 1     | ✅ done + applied remotely      |
| Storage-listing fix migration      | `supabase/migrations/20260714203433_drop_tiles_listing_policy.sql`            | 1     | ✅ applied remotely; PR pending |
| Domain: types, ports, service      | `src/lib/doodle-wall/`                                                        | 1     | ✅ done                         |
| Supabase clients + adapters        | `src/lib/supabase/` (dormant until provisioning)                              | 1     | ✅ done                         |
| Submit route (thin) + rate limiter | `src/app/api/tiles/route.ts` + `rateLimit.ts`                                 | 1     | ✅ done                         |
| Wall route (thin, cacheable)       | `src/app/api/wall/route.ts`                                                   | 1     | ✅ done                         |
| Env vars (4, all optional)         | `.env.schema` (SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY, SUBMITTER_HASH_SECRET) | 1     | ✅ done                         |
| Tuning config (three-free) + tests | `src/components/three/game/doodleWallConfig.ts`                               | 1     | ✅ done                         |
| In-scene stall + tile grid         | `src/components/three/game/DoodleWall.tsx`                                    | 1     | ✅ done                         |
| Drawing overlay                    | `src/components/overlays/DoodleWallHud.tsx`                                   | 1     | ✅ done                         |
| Store slice                        | `src/store/scene.ts` (`doodleWallPhase`)                                      | 1     | ✅ done                         |
| Attraction entry                   | `src/components/three/synty/attractions.ts` (`doodle-wall`)                   | 1     | ✅ done                         |
| Admin queue page                   | `src/app/admin/page.tsx`                                                      | 2     | —                               |
| Approve/reject route               | `src/app/api/admin/tiles/[id]/route.ts`                                       | 2     | —                               |
| Keepalive route + cron             | `src/app/api/keepalive/route.ts` + Vercel cron                                | 2     | —                               |

## 5. Decisions

**Made (grill session, Nick, 2026-07-14 — unchanged):** Supabase backend (ADR-0001,
reaffirmed); staged delivery, visitor path first; loose hexagonal architecture (§2);
skills mandate (§2); overlay shows wall + drawing surface and is the wall's home on the
no-canvas tier; wall bound 48 / scene 24 (6×4), age-out = falling out of the query, rows
and PNGs retained; 512→256 tile, server rejects wrong dimensions or >128KB; fixed
near-black ground + ~6 neon inks, 3 brushes, undo 20, clear, no eraser/text; burst
2/min/IP in-memory + durable daily cap 10 via `submitter_hash` = HMAC-SHA256(IP, env
secret).

**Revised (Nick, 2026-07-14, after seeing the build):** the grill's "Synty stall +
bulb-strung board" is superseded — **no stall prefab at all**. The doodle wall is the
freestanding bulb-strung board alone, on its own poles (`4860738`). It is still a
_stall_ in the glossary sense (a steppable game); it just has no Synty stall structure.

**Backend-slice deviations (canon):** JSON `{ error }` bodies; no zod length cap on the
base64 field (raw ceiling + service byte cap own size); fake-adapter seed PNGs generated
programmatically.

**Close-out fixes (code review `c43bf60`, now canon):**

- `#doodle-wall` hash-open routes through `stepIn()` — no private open-channel for the
  overlay; mode-keyed chrome yields on every tier.
- `submit()` continuation is visit-guarded — exit during `submitting` cannot clobber the
  next visit's phase.
- One stroke, one pointer — secondary touches/buttons cannot orphan a live stroke.
- Deterministic rejections (too-large, 400/403) get distinct error cards; only transient
  failures offer Try again.
- Byte-accurate body ceiling + Content-Length pre-check.
- **Anon INSERT policy dropped from the migration** — writes are service-role only.
- Production tripwire: partial Supabase env throws rather than silently serving fakes.
- Failed row insert compensates by removing the just-uploaded PNG
  (`TileImageStore.remove()`).
- `getWall()` projects to the public `WallTile` shape at the domain boundary; the type
  lives in `src/lib/doodle-wall/types.ts`, config re-exports it.
- `StaticCv`'s `#doodle-wall` link has a server-rendered target.
- `DoodleWall` has its own `?off=doodle` debug key.
- Daily-cap count-then-insert TOCTOU is **accepted and documented** (worst case: a
  racer lands one tile over cap; pre-moderation queue absorbs it).

**Parked follow-ons (verified in review, deliberately not fixed — pick up post-merge):**

- Card chrome triplicated across `overlays/BallTossHud.tsx` / `HighStrikerHud.tsx` /
  `DoodleWallHud.tsx` → extract a shared `overlays/CardShell`.
- `/api/wall` fetch duplicated between `three/game/DoodleWall.tsx` and
  `overlays/DoodleWallHud.tsx` → shared `fetchWallTiles` helper.
- Fortune/tiles route preamble + rate-limit factory duplication → shared `src/lib/api`
  helpers.
- `stepIn()` per-stall reset ternary accretion in `src/store/scene.ts` → data-driven
  `FRESH_ON_STEP_IN` map.
- Undo-bake allocates a fresh canvas + 1MB readback per stroke past depth 20
  (`DoodleWallHud.tsx`) → persistent baked canvas.
- Submit ships base64 JSON (4 buffer passes) → `toBlob` + raw body (contract change —
  renegotiate §2.1 when taken).
- Daily-cap count uses `count: 'exact'` unbounded (`src/lib/supabase/tileRepository.ts`)
  → `limit(cap)` probe.
- `DoodleWall.tsx` halo block duplicates `BulbGlow`'s sprite policy → shared
  `HaloPoints`.
- Glossary-guard advisory: `resume-*` section ids in `src/components/cv/StaticCv.tsx`
  extend a pre-existing convention — a follow-on sweep should rename the whole family to
  `cv-*` (CV, not resume, per CONTEXT.md).

**Provisioning canon (2026-07-14, post-merge session):**

- `storage.objects` carries **zero policies** — intentional. The bucket-level public
  flag serves approved-tile URLs by object URL; there is no listing; all writes are
  service-role only. Do not add storage policies back "for completeness"
  (`20260714203433_drop_tiles_listing_policy.sql` has the reasoning).
- The project uses the **new-format Supabase API keys**: `SUPABASE_SERVICE_ROLE_KEY`
  takes a **secret key** (`sb_secret_...`), `SUPABASE_ANON_KEY` takes a **publishable
  key** (`sb_publishable_...`). The anon/publishable key is unused until Stage 2.

**Open:**

- Admin queue UX details (batch approve, preview size) — resolve at Stage 2 start.

**Needs Nick (human gates):**

- **Merge the storage-listing PR** (from `fix/doodle-wall-storage-listing`) — the
  migration is already live on the hosted project; the PR brings the repo in line.
- **Env vars (the remaining provisioning step):** set the four vars in `.env.local`
  and Vercel — **all four together** (partial env in production throws). Key formats
  per the provisioning canon above. Project creation and migrations are done (§1).
- **Stub→real end-to-end check** once the env lands (§6) — draw → submit → `pending`
  row, tile NOT on the wall.
- Stage 2 admin allow-list uses Nick's actual Google identity — collect it at Stage 2
  start; never widen to "any Google login" (ADR-0001).

## 6. How to verify

- **Gate (every slice):** `pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`
  — all green at `c43bf60` (120 tests, keyless).
- **Domain + routes + config:** ✅ covered by colocated unit tests against fakes.
- **Scene/overlay headless:** recipe in `ball-toss-game-handoff.md` §6 (Playwright +
  swiftshader, `?debug=1` + `window.__sceneStore`; `?off=doodle` isolates the wall).
  ✅ Re-verified at `4860738`: fly-in frames the freestanding board (grid + bulbs +
  fence behind) and the board reads from the travelling view past the big top
  (scripts: `/tmp/shot/doodle-board.mjs`, `doodle-area.mjs` — uncommitted rig). Still
  unexercised visually: the new error cards and the `#doodle-wall` hash entry.
- **Remote schema/policies:** `supabase migration list` — local/remote in sync;
  `supabase db advisors --linked` — "No issues found" (both verified 2026-07-14).
- **End-to-end (real Supabase — unblocked once Nick sets the four env vars):** draw →
  submit → row `pending` and NOT on the wall → approve (SQL by hand until Stage 2) →
  tile appears on next `/api/wall` load. Non-allow-listed Google account denied
  `/admin` (Stage 2).
- **Degradation:** WebGL off → `StaticCv` link → overlay with `<img>` tiles.

## 7. Gotchas (inherited — details in `ball-toss-game-handoff.md` §7)

- R3F lint rules: mutate refs only in `useFrame`/handlers; per-frame state in refs, only
  summaries in the store.
- Low tier runs `frameloop='demand'` — call `invalidate()` while anything animates.
- No EffectComposer/bloom additions; emissive + `BulbGlow` sprites only.
- Spawned GLB props rendering black → `material.vertexColors = false`.
- Never `rm -rf .next` while a dev server runs; clean prod build for verification.
- No `@react-three/*` imports in the static bundle; overlays may import three-free
  config modules only (`doodleWallConfig.ts` must stay three-free).
- Tile PNGs are user content: treat as untrusted (validate server-side, cap dimensions
  and bytes; no SVG).
- `GET /api/wall` `imageUrl` is a data URI in stub mode, an https Storage URL with
  Supabase — scene textures and overlay `<img>`s must handle both.
- Bisection keys: `?off=doodle` unmounts the wall; `?off=game` covers only the game sims.
- Nick's dev server usually holds port 3000 — smoke servers go on a spare port.
- Commit messages end `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## 8. Build order

1. ~~Grill session closes open decisions~~ ✅ 2026-07-14; outcomes in §5.
2. ~~Domain layer + fake adapters + unit tests~~ ✅ (`58bf8ad`).
3. ~~Routes (thin), stub mode, dormant Supabase adapters~~ ✅ (`6d758dc`); contracts §2.1.
4. ~~Scene: attraction entry + stall + wall grid~~ ✅ (`f06f27a`, `20ecc3c`, `bc376a7`).
5. ~~Overlay: drawing surface + submit flow + store slice~~ ✅ (`c600659`, `c902fa5`).
6. ~~Close-out: glossary-guard → /code-review (high) → docs-scribe → absorb~~ ✅
   (`5a2df8d`, `c43bf60`; docs-scribe + this absorb 2026-07-14).
7. ~~Raise the Stage 1 PR~~ ✅ **PR #65 open** (docs sync `b4bc279`; board-only
   revision `4860738` pushed to it).
8. ~~PR #65 review + merge~~ ✅ **merged to master** (`12d4a39`, 2026-07-14).
9. ~~Provision Supabase: project + migrations~~ ✅ 2026-07-14 via the CLI (§1);
   includes the storage-listing fix, applied remotely, PR pending.
10. **← YOU ARE HERE. Blocked on Nick:** (a) merge the storage-listing PR →
    (b) set the four env vars in `.env.local` + Vercel (all four together; key
    formats §5) → (c) stub→real end-to-end check (§6).
11. Stage 2: admin + keepalive, same shape (brief from this doc; contracts in §2.1;
    needs Nick's Google identity for the allow-list before any code).

## 9. What just happened

2026-07-14 (latest) — **PR #65 merged to master (`12d4a39`), then Supabase was
provisioned in the same session via the CLI.** Project **iamnick** created (ref
`hzwjezozoxlopyfgmxoc`, Central EU Frankfurt); `supabase link` + `db push` applied the
Stage 1 migration, local/remote in sync, and the remote state was verified (RLS on,
single approved-only SELECT policy, bucket limits correct). The advisors run then
flagged `0025_public_bucket_allows_listing`: the migration's `storage.objects` SELECT
policy did nothing on a public bucket except let anon LIST it — enumerating
pending/rejected tile PNGs uploaded ahead of moderation. Follow-up migration
`20260714203433_drop_tiles_listing_policy.sql` drops it; applied remotely (advisors
now clean), small PR from `fix/doodle-wall-storage-listing` pending. `.mcp.json` now
carries a Supabase MCP server config (untracked, not yet OAuth-connected — CLI is the
working path). **Waiting on Nick** (§8 step 10): merge the storage-listing PR, set the
four env vars, run the end-to-end check; then Stage 2 (Google identity first).

Earlier the same day: the close-out chain (`5a2df8d`, `c43bf60`, `b4bc279`) and
Nick's board-only revision (`4860738` — stall prefab dropped, freestanding board at
three (17.5, 39), `Attraction.prefab` optional) landed on the PR before merge.

For a NEW session picking this up: read `CONTEXT.md`, then this doc top to bottom —
§2.1 has the frozen contracts, §5 the canon decisions + parked follow-ons, §8 the next
action. The `carnival-context` agent (`.claude/agents/carnival-context.md`) briefs
builders from this doc and absorbs outcomes back into it — keep that loop.
