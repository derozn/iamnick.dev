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
> Stage 1 merged and live (PRs #65–#68). Stage 2 merged and live (PR #69).
> Housekeeping merged and live (PR #70). Every Nick-gate cleared 2026-07-16 —
> the doodle wall is fully live end to end. PRs target `master`.

---

## 0. TL;DR of what to do

Staged delivery, each slice its own PR:

1. **Stage 1 — visitor path:** ✅ **complete, LIVE-VERIFIED end to end, and fully
   merged.** PR #65 (`12d4a39`), storage-listing PR #66 (`cbcd832`), e2e varlock
   fix PR #67 (`0e60a41`) and mobile-framing PR #68 (`4631df6`) all on master;
   Supabase provisioned, all four env vars set, real-Supabase e2e passed (§6).
2. **Stage 2 — moderation:** ✅ **MERGED AND LIVE** (PR #69, `f592da8`): `/admin`
   — the carny's counter — over the pre-moderation queue (Supabase Auth, Google
   OAuth, hard allow-list `nick@iamnick.dev` only), verdict route, daily
   keepalive cron. Nick completed the Google OAuth config gate and confirmed
   `/admin` works in production ("This works great").
3. **Housekeeping — the counter's second view:** ✅ **MERGED AND
   LIVE-VERIFIED** (PR #70, `c70ff22`): `/admin/wall` shows the wall exactly
   as hung and offers Take down — the final reject verdict — per tile,
   guarded by two-tap arm/confirm. Nick's phone check passed 2026-07-16.

Nothing is in flight. Next work = Nick's three future follow-ons (§5), all
unscoped and deliberately not started.

## 1. Current state (verified 2026-07-16, master `c70ff22`)

**Everything is merged, configured, and live-verified** — Stages 1 and 2 plus
housekeeping (PR #70, `c70ff22`). Nick cleared the last two human gates on
2026-07-16: the phone check of `/admin/wall` and the real-GPU look pass on the
freestanding board (including the mobile fly-in framing). **No open
Nick-gates.**

**Stage 1 (all merged to master):**

- **Backend:** domain layer `src/lib/doodle-wall/` (`types.ts` — home of the public
  `WallTile` shape — `constants.ts`, `ports.ts`, `png.ts`, `submitterHash.ts`,
  `tileService.ts`, `fakes.ts`, colocated tests); thin routes
  `src/app/api/tiles/route.ts` (+ sibling `rateLimit.ts`, burst 2/min/IP) and
  `src/app/api/wall/route.ts`; Supabase adapters in `src/lib/supabase/`
  (supabase-js confined there, grep-verified). Migrations applied remotely: tiles
  table + RLS **select-approved-only, no anon INSERT** (all writes service-role);
  `tiles` bucket public-read, 128KB + image/png limits, listing policy dropped
  (PR #66). Absent env = stub mode; **partial Supabase env in production throws**.
- **Scene:** `three/game/doodleWallConfig.ts` (three-free; re-exports server truths
  and `WallTile`) and `three/game/DoodleWall.tsx` — a **freestanding** bulb-strung
  6×4 tile-grid board on poles in the NE fence corner at three **(17.5, 39)**, fed
  by `GET /api/wall`; no stall prefab (Nick's revision `4860738`). Attraction entry
  `doodle-wall` in `synty/attractions.ts` declares `frameWidth: 3.6` (mobile
  framing, PR #68). Own bisection key `?off=doodle`.
- **Overlay + store:** `overlays/DoodleWallHud.tsx` — step-in overlay showing the
  approved wall (`<img>` grid) plus the 512→256 drawing surface
  (palette / 3 brushes / undo 20 / clear) and submit. Store slice `doodleWallPhase`
  (`intro | drawing | submitting | submitted | error`) in `src/store/scene.ts`;
  `stepIn('doodle-wall')` resets it atomically; `#doodle-wall` hash-open routes
  through `stepIn()`; `StaticCv` carries a server-rendered target for the
  no-canvas tier.
- **Merged PRs:** #65 Stage 1 (`12d4a39`), #66 storage-listing drop (`cbcd832`),
  #67 e2e varlock fix (`0e60a41`, carries `6cc67f9` — `SUPABASE_URL`
  `@sensitive=false`, §7), #68 mobile framing + NPC re-routes (`4631df6` —
  optional `Attraction.frameWidth` honoured by `IsoControls`; portrait-verified).
- **Supabase live:** project **iamnick**, ref `hzwjezozoxlopyfgmxoc`, Central EU
  (Frankfurt); migrations local/remote in sync, advisors clean; all four env vars
  set (`.env.local` + Vercel, legacy JWT-format keys — §5); real-Supabase
  end-to-end check PASSED 2026-07-14 (§6).

**Stage 2 (merged to master as PR #69, `f592da8`; live and Nick-confirmed):**

- **Domain:** `tileService` gained `getQueue()` — oldest-first `pending`, bounded by
  the new constant `QUEUE_PAGE_COUNT` (48), projected through a shared `toWallTile`
  helper, **the** privacy boundary (`submitterHash`/`imagePath` never cross it) —
  and `moderate({ id, verdict })` with the transition rules: approve
  `pending→approved`; reject `pending|approved→rejected` (approved→rejected = a
  takedown); **rejected is final**. `TileRepository` port gained
  `oldestPending` / `findById` / `setStatus`. The Supabase adapter maintains
  `approved_at` (set on approve, cleared otherwise) and maps Postgres `22P02`
  invalid-uuid to `null`, so malformed ids 404 rather than 500.
- **Auth (`src/lib/supabase/adminAuth.ts`, server-only):** `@supabase/ssr` 0.12.3
  cookie sessions, all server-side — **the anon key never reaches the client
  bundle**. `getClaims()` (JWKS-verified) + hard allow-list
  `MODERATOR_EMAILS = ['nick@iamnick.dev']`, moved OUT of `doodle-wall/constants.ts`
  into this server-only module (structural boundary — `constants.ts` is
  client-reachable via `doodleWallConfig`), + a **provider pin**: the session must
  be Google (`app_metadata.provider(s)`), so an email/password account claiming the
  carny's address can never pass. The configured-predicate matches
  `getTileAdapters` (all three Supabase vars, or stub). `requestOrigin()` pins to
  `SITE_URL` in production (`x-forwarded-host` never steers redirects);
  dev/preview use the request URL origin. No middleware/proxy — one page, one
  person; an expired token simply reads as signed-out.
- **Routes:** `GET /api/admin/auth/login` (server-side `signInWithOAuth` google →
  303), `GET …/callback` (`exchangeCodeForSession` → `/admin`; failures →
  `/admin?auth=error`), `POST …/logout`. `PATCH /api/admin/tiles/:id` — contract in
  §2.1. `GET /api/keepalive` → `{ ok, mode: 'live' | 'stub' }` with an optional
  `CRON_SECRET` guard (timing-safe compare); `vercel.json` cron daily 08:00 UTC.
  `.env.schema`: new `CRON_SECRET` (`@sensitive @optional`); the
  `SUPABASE_ANON_KEY` comment updated (drives admin auth, server-only).
- **UI:** `/admin` is **the carny's counter** (CONTEXT.md gained entries _The
  carny's counter_ and _Verdict_; _The carny_ widened — Nick IS the carny at the
  counter; "moderation queue" copy corrected to the canon "pre-moderation queue").
  Server page with four identity states
  (unconfigured / anonymous / denied / moderator), letterpress ticket-frame
  styling, noindex + `robots.ts` disallow `/admin` and `/api/`. `AdminQueue`
  client component: oldest-first cards, approve/reject per tile, stale cards
  dropped only on tile-level reasons (not bare 404s), keyed remount on refresh so
  `router.refresh()` actually updates the list.
- **Tests:** Stage 2 brought the suite to 149 (was 120): tileService queue +
  verdict rules, adminAuth allow-list, PATCH route (guards + verdicts),
  keepalive, `AdminQueue` component. Close-out chain done: glossary-guard (5
  findings) and /code-review high (24 candidates → 10 confirmed, all fixed;
  list in §5).

**Housekeeping (merged to master as PR #70, `c70ff22`; live and phone-checked):**

- **`/admin/wall` — the counter's second view:** the wall exactly as hung —
  reuses `tileService.getWall()`, same newest-first bounded 48; tiles older
  than the bound have aged out of public view, so the hung set is all
  housekeeping can need. Each tile carries a Take down button = the final
  reject verdict (approved→rejected, §2.1 — no restore), guarded by a two-tap
  arm/confirm; arming one tile re-arms off any other.
- **Shared shell extracted:** `src/app/admin/AdminGate.tsx` (header, queue/wall
  tabs, the three non-moderator identity states, `CounterCard`,
  `SignOutButton`) — this took the parked "card-shell dedup across `/admin`"
  follow-on; both pages are now slim identity+data wrappers. Shared client
  PATCH helper `src/app/admin/verdictClient.ts` (`sendVerdict` →
  `'done' | 'stale' | 'error'`) used by `AdminQueue` and `AdminWall` —
  reason-gated staleness handling now lives in ONE place.
- **CONTEXT.md widened:** _The carny's counter_ now names two views — the
  queue (`/admin`, pre-moderation verdicts) and the wall (`/admin/wall`,
  housekeeping/take-downs).
- **No route/domain/schema changes:** `PATCH /api/admin/tiles/:id` and the
  verdict rules are untouched; §2.1 contracts unchanged.
- **Tests:** 156 (was 149) — new `AdminWall` component suite (arm-only first
  tap, commit on second, re-arm on other tile, stale drop, transient error,
  bare-wall state). Gate green: typecheck / lint / test:ci / build
  (`/admin/wall` in the route list).

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

### 2.1 Landed contracts (do not renegotiate)

**Server truths** (`src/lib/doodle-wall/constants.ts` — re-exported by
`doodleWallConfig.ts`, never redefined): `STORED_TILE_SIZE` 256, `DRAWING_CANVAS_SIZE`
512, `TILE_MAX_BYTES` 131072, `WALL_TILE_COUNT` 48, `SCENE_TILE_COUNT` 24,
`QUEUE_PAGE_COUNT` 48, `SUBMIT_BURST_PER_MINUTE` 2, `SUBMIT_DAILY_CAP` 10.
`MODERATOR_EMAILS` is deliberately NOT here — it lives in the server-only
`src/lib/supabase/adminAuth.ts` (§5).

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

**Pre-moderation queue (domain, no public route)** — the queue is server-rendered
into `/admin`, never exposed anonymously. `tileService.getQueue()`: oldest-first
`pending`, ≤ `QUEUE_PAGE_COUNT` (48), projected to `WallTile` through the same
`toWallTile` helper as `getWall()` — the single privacy boundary.

**`PATCH /api/admin/tiles/:id`** — body `{ "verdict": "approve" | "reject" }`.
200 → `{ id, status }`. Errors as `{ error }` JSON: 401 anonymous, 403 for both
not-the-carny AND bad-origin (the same cross-site Origin rejection as
`POST /api/tiles`), 400 bad body, 404 unknown/malformed id, 409
invalid-transition, 503 stub mode. Transitions: approve `pending→approved`;
reject `pending|approved→rejected`; rejected is final.

**`GET /api/keepalive`** — 200 → `{ ok, mode: 'live' | 'stub' }`. If `CRON_SECRET`
is set, the bearer token must match (timing-safe compare); unset means open.
Driven by the `vercel.json` cron, daily 08:00 UTC.

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

| Piece                               | Path                                                                                       | Stage | Status                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------ | ----- | --------------------------------------------------- |
| SQL migration (tiles, RLS, bucket)  | `supabase/migrations/20260714115029_doodle_wall.sql`                                       | 1     | ✅ done + applied remotely                          |
| Storage-listing fix migration       | `supabase/migrations/20260714203433_drop_tiles_listing_policy.sql`                         | 1     | ✅ merged (PR #66, `cbcd832`)                       |
| Domain: types, ports, service       | `src/lib/doodle-wall/`                                                                     | 1     | ✅ done                                             |
| Supabase clients + adapters         | `src/lib/supabase/` (dormant until provisioning)                                           | 1     | ✅ done                                             |
| Submit route (thin) + rate limiter  | `src/app/api/tiles/route.ts` + `rateLimit.ts`                                              | 1     | ✅ done                                             |
| Wall route (thin, cacheable)        | `src/app/api/wall/route.ts`                                                                | 1     | ✅ done                                             |
| Env vars (5, all optional)          | `.env.schema` (SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY, SUBMITTER_HASH_SECRET, CRON_SECRET) | 1+2   | ✅ 4 set live; CRON_SECRET optional (§5 Needs Nick) |
| Tuning config (three-free) + tests  | `src/components/three/game/doodleWallConfig.ts`                                            | 1     | ✅ done                                             |
| In-scene stall + tile grid          | `src/components/three/game/DoodleWall.tsx`                                                 | 1     | ✅ done                                             |
| Drawing overlay                     | `src/components/overlays/DoodleWallHud.tsx`                                                | 1     | ✅ done                                             |
| Store slice                         | `src/store/scene.ts` (`doodleWallPhase`)                                                   | 1     | ✅ done                                             |
| Attraction entry                    | `src/components/three/synty/attractions.ts` (`doodle-wall`)                                | 1     | ✅ done                                             |
| The carny's counter (queue view)    | `src/app/admin/page.tsx` + `AdminQueue.tsx`                                                | 2     | ✅ merged (PR #69)                                  |
| Verdict route                       | `src/app/api/admin/tiles/[id]/route.ts`                                                    | 2     | ✅ merged (PR #69)                                  |
| Auth routes (login/callback/logout) | `src/app/api/admin/auth/*/route.ts`                                                        | 2     | ✅ merged (PR #69)                                  |
| Admin auth (server-only)            | `src/lib/supabase/adminAuth.ts` (allow-list, provider pin, origin pin)                     | 2     | ✅ merged (PR #69)                                  |
| Keepalive route + cron              | `src/app/api/keepalive/route.ts` + `vercel.json`                                           | 2     | ✅ merged (PR #69)                                  |
| Counter shell (shared)              | `src/app/admin/AdminGate.tsx` (header, tabs, identity states, CounterCard, SignOutButton)  | HK    | ✅ merged (PR #70)                                  |
| Verdict client helper (shared)      | `src/app/admin/verdictClient.ts` (`sendVerdict` → done \| stale \| error)                  | HK    | ✅ merged (PR #70)                                  |
| The counter's wall view             | `src/app/admin/wall/page.tsx` + `AdminWall.tsx` (take-downs, two-tap arm/confirm)          | HK    | ✅ merged (PR #70)                                  |

HK = the housekeeping slice (the counter's second view, §0 item 3).

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

**Mobile framing (Nick's report, 2026-07-15):** the fly-in must show the whole
board on portrait phones. Mechanism: per-attraction optional `frameWidth` in
`synty/attractions.ts`, honoured by `IsoControls` — back off beyond `focusDist`
until that world width fits the horizontal fov. `doodle-wall` declares 3.6 m;
attractions that declare none are untouched. Tune `frameWidth`, not `focusDist`,
if the board's margins change.

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

**Stage 2 decisions (build session, 2026-07-15 — now canon):**

- **Allow-list is structural, not just data:** `MODERATOR_EMAILS` lives in the
  server-only `src/lib/supabase/adminAuth.ts`, never in
  `doodle-wall/constants.ts` (client-reachable via `doodleWallConfig`). Hard-coded
  `['nick@iamnick.dev']` — never widen (ADR-0001).
- **Provider pin:** a passing session must be a Google session
  (`app_metadata.provider(s)`); an email/password signup claiming the carny's
  address can never pass, even before the dashboard-side provider is disabled.
- **Origin pin:** `requestOrigin()` returns `SITE_URL` in production —
  `x-forwarded-host` never steers OAuth redirects. Dev/preview use the request
  URL origin.
- **No middleware/proxy** for `/admin` — one page, one person; an expired token
  reads as signed-out and the page re-offers login.
- **Verdict transitions** (encoded in `tileService.moderate`): approve
  `pending→approved`; reject `pending|approved→rejected` (approved→rejected is a
  takedown); rejected is FINAL — never restored.
- The Supabase adapter owns `approved_at` (set on approve, cleared otherwise);
  `findById` maps Postgres `22P02` to `null` so malformed ids 404.
- **Glossary additions (CONTEXT.md):** _The carny's counter_ (= `/admin`; plain
  DOM page, not an attraction/stall/overlay; "booth" stays banned) and _Verdict_
  (approve | reject); _The carny_ widened — Nick IS the carny at the counter.

**Stage 2 close-out fixes (code review, 2026-07-15 — 24 candidates, 10 confirmed,
all fixed):** queue-refresh no-op (keyed remount so `router.refresh()` bites);
provider pin; forwarded-host trust in redirects; timing-safe `CRON_SECRET`
compare; blind 404 card-drop (stale cards now dropped only on tile-level
reasons); configured-predicate disagreement with `getTileAdapters`; `22P02` →
500 (now 404); missing Origin check on PATCH; duplicated privacy projection
(now one `toWallTile`); allow-list in a client-reachable module (moved to
`adminAuth.ts`).

**Housekeeping decisions (build session, 2026-07-16 — now canon):**

- **Housekeeping is bounded to the hung wall by design:** `/admin/wall` reuses
  `tileService.getWall()` (newest-first, ≤48). Tiles older than the bound have
  aged out of public view, so the hung set is all housekeeping can need — no
  new query, no pagination.
- **Take down = the final reject verdict** (approved→rejected, §2.1). No
  restore exists, so the button is guarded by a two-tap arm/confirm; arming a
  tile disarms any other.
- **One staleness path:** the reason-gated stale handling (drop the card only
  on tile-level reasons, not bare 404s) lives solely in
  `src/app/admin/verdictClient.ts` (`sendVerdict`), shared by `AdminQueue` and
  `AdminWall`.
- **CONTEXT.md widened:** _The carny's counter_ now names two views — the
  queue (`/admin`) and the wall (`/admin/wall`).

**Parked follow-ons (verified in review, deliberately not fixed — pick up post-merge):**

- **(Stage 2)** Atomic transition port method — a single conditional UPDATE instead
  of `findById` + `setStatus` (the `setStatus` write is unconfirmed against the
  read; the race window is Nick-vs-Nick, so parked).
- **(Stage 2)** Rate limiting on the admin auth routes.
- **(Stage 2)** Pin session cookie flags explicitly rather than inheriting
  `@supabase/ssr` defaults.
- **(Stage 2)** `requireModerator()` route-preamble helper — extract when a second
  admin route appears.
- ~~**(Stage 2)** Card-shell dedup across `/admin`~~ ✅ **taken by the
  housekeeping slice** (`AdminGate.tsx` — both `/admin` pages are now slim
  identity+data wrappers). The three-HUD `CardShell` half remains parked below.

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

**Future follow-ons (Nick, 2026-07-16 — open, deliberately not started):**

1. **AI moderation (Claude API):** Nick wants tile verdicts assisted or made
   by AI — e.g. Claude vision pre-screening, or auto-verdicts feeding (or
   replacing) the carny's pre-moderation queue. Unscoped. Needs decisions on
   human-in-the-loop vs auto-approve, cost, and prompt-injection-resistant
   handling of untrusted images (tile PNGs are user content — §7). The
   Anthropic key already exists for Madame Zara (`ANTHROPIC_API_KEY`).
2. **Counter styling:** the near-black `background-primary` behind `/admin`
   washes out the text and card chrome — Nick wants a more neutral backdrop
   for the counter pages.
3. **Counter routing:** `/admin` ↔ `/admin/wall` tab switches are full server
   roundtrips; explore Next.js parallel/intercepting routes ("amazing for
   dashboard-like configurations" — Nick's suggestion, his words).

**Provisioning canon (2026-07-14, post-merge session):**

- `storage.objects` carries **zero policies** — intentional. The bucket-level public
  flag serves approved-tile URLs by object URL; there is no listing; all writes are
  service-role only. Do not add storage policies back "for completeness"
  (`20260714203433_drop_tiles_listing_policy.sql` has the reasoning).
- **API keys as deployed:** Nick set `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
  with the **legacy JWT-format keys** (values start `ey…`) — fully supported and
  verified working by the e2e. A later swap to the new-format keys (`sb_secret_...` /
  `sb_publishable_...`) needs **no code change**; the adapters are format-agnostic.
  The anon key is unused until Stage 2.
- `SUPABASE_URL` is `@sensitive=false` in `.env.schema` (e2e fix `6cc67f9`, merged
  PR #67): every Storage public URL that `GET /api/wall` returns embeds the project
  URL, so marking it sensitive made varlock's runtime leak scan 500 the route as
  soon as any tile was approved. Same reasoning as the Sentry DSN precedent. The
  anon key, by contrast, **stays `@sensitive`** — Stage 2 kept it server-only
  (cookie sessions, no client-side Supabase).
- The rejected e2e test tile stays in the project (canon: rows and PNGs retained) —
  row `315595ae-efe4-477f-929f-8f0f3362e61e`, image
  `973052c3-1ed7-45b1-98e4-30cb8dbd219a.png`, status `rejected`. Not a stray; do not
  clean it up.

**Open:** none — the Stage 2 queue UX questions (batch approve, preview size)
were resolved by the build: one verdict per tile, no batching; card previews.

**Needs Nick (human gates):** none — every gate is cleared as of 2026-07-16.
The three future follow-ons above are Nick's own asks awaiting his scoping and
prioritisation, not gates on anything shipped.

**Done by Nick (2026-07-15/16):** the Stage 2 config gate — Google OAuth
client, Supabase Google provider + URL configuration — complete; `/admin`
confirmed working in production ("This works great"). Then on 2026-07-16:
merged PR #70, passed the phone check of `/admin/wall`, and did the real-GPU
look pass on the freestanding board (outstanding since `4860738`, including
the mobile fly-in framing). `CRON_SECRET` remains optional.

## 6. How to verify

- **Gate (every slice):** `pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`
  — all green at the housekeeping merge (156 tests, keyless; `/admin/wall` in
  the build's route list).
- **Domain + routes + config:** ✅ covered by colocated unit tests against fakes —
  Stage 2 added tileService queue + verdict rules, adminAuth allow-list, PATCH
  route guards + verdicts, keepalive, and the `AdminQueue` component; the
  housekeeping slice added the `AdminWall` suite (arm-only first tap, commit on
  second, re-arm on other tile, stale drop, transient error, bare-wall state).
- **The carny's counter, stub mode:** ✅ smoke-tested by portrait screenshot
  (unconfigured state renders; no auth possible pre-config).
- **Scene/overlay headless:** recipe in `ball-toss-game-handoff.md` §6 (Playwright +
  swiftshader, `?debug=1` + `window.__sceneStore`; `?off=doodle` isolates the wall).
  ✅ Re-verified at `4860738`: fly-in frames the freestanding board (grid + bulbs +
  fence behind) and the board reads from the travelling view past the big top
  (scripts: `/tmp/shot/doodle-board.mjs`, `doodle-area.mjs` — uncommitted rig).
  Framing changes need a **portrait shot too** (390×844 viewport): the whole 6×4
  grid, bulbs and both poles must sit in frame during the fly-in — ✅ verified
  2026-07-15 with `frameWidth: 3.6`, desktop unchanged. Nick's real-GPU look
  pass (2026-07-16) closed the visual gate headless swiftshader couldn't judge.
- **Remote schema/policies:** `supabase migration list` — local/remote in sync;
  `supabase db advisors --linked` — "No issues found" (both verified 2026-07-14).
- **End-to-end (real Supabase):** ✅ **PASSED 2026-07-14** (prod build, port 3001,
  real env). Full chain: `GET /api/wall` → `{"tiles":[]}` (real mode, not stub seeds)
  → `POST /api/tiles` with a 256×256 test PNG → 201 `pending` → wall still empty
  (pending invisible) → remote row verified (`pending`, `submitter_hash` set) → tile
  PNG fetched anonymously by its Storage public URL (200, byte-identical) → anon
  bucket-listing returned `[]` (listing-policy drop live) → SQL approve → wall served
  it with the real Storage URL → SQL reject → wall empty again. Test tile retained by
  design (ids in §5).
- **Stage 2 end-to-end:** the config gate is done and Nick confirmed `/admin`
  works in production (2026-07-15/16). Legs not yet exercised live: a
  non-allow-listed Google account → denied; `GET /api/keepalive` →
  `{ ok: true, mode: 'live' }` (with the bearer token if `CRON_SECRET` is set).
- **Housekeeping live check:** ✅ **PASSED 2026-07-16** — Nick's phone check:
  `/admin/wall` shows the wall exactly as hung; Take down arms on the first
  tap and commits on the second; the tile leaves the public wall on next load.
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
- **varlock leak scan vs public env values:** any env value that legitimately appears
  in a response body or the client bundle must be `@sensitive=false` in `.env.schema`,
  or varlock's runtime leak scan (patched `Response.json`) 500s the route the moment
  the value shows up. Found live by the e2e: `SUPABASE_URL` sits inside every approved
  tile's `imageUrl`, so a sensitive URL killed `GET /api/wall` on the first approved
  tile. Check this for every future var. (The anon key dodged it — Stage 2 kept it
  server-only, so it stays `@sensitive`.)
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
9. ~~Provision Supabase: project + migrations~~ ✅ 2026-07-14 via the CLI (§1).
10. ~~Storage-listing PR~~ ✅ merged as PR #66 (`cbcd832`); ~~env vars~~ ✅ set by
    Nick, `.env.local` + Vercel, legacy JWT keys (§5); ~~stub→real end-to-end
    check~~ ✅ **PASSED** (§6) — and found + fixed the varlock `SUPABASE_URL` bug
    en route (§7).
11. ~~Merge the fix PRs~~ ✅ #67 (`0e60a41`, e2e varlock fix) and #68 (`4631df6`,
    mobile framing + NPC re-routes) merged to master.
12. ~~Stage 2: admin + keepalive~~ ✅ **merged as PR #69** (`f592da8`); built
    2026-07-15, gate green, glossary-guard + /code-review close-out done (§1, §5).
13. ~~Nick's config gate + live check~~ ✅ 2026-07-15/16: Google OAuth client
    - Supabase provider/URL config done; `/admin` confirmed working in
      production ("This works great"). `CRON_SECRET` remains optional.
14. ~~Housekeeping: `/admin/wall` + shared counter shell~~ ✅ **built
    2026-07-16** on `feature/doodle-wall-housekeeping` (gate green, 156 tests
    — §1).
15. ~~Housekeeping PR → merge → Nick's phone check; real-GPU look pass~~ ✅
    2026-07-16: PR #70 merged (`c70ff22`); phone check of `/admin/wall` and
    the real-GPU look pass on the board both passed.
16. **← YOU ARE HERE:** done — no open work, no open Nick-gates. Next work,
    when Nick picks it up, is his future follow-ons (§5): AI moderation,
    counter styling, counter routing. All unscoped; scope before building.

## 9. What just happened

2026-07-16 (latest) — **Housekeeping merged; every gate cleared — the doodle
wall is fully live end to end.** PR #70 merged to master (`c70ff22`); Nick's
phone check of `/admin/wall` passed and his real-GPU look pass on the
freestanding board (outstanding since `4860738`, including the mobile fly-in
framing) is done. No open Nick-gates. Nick then filed three future follow-ons,
recorded in §5 and deliberately not started: AI moderation of tiles via the
Claude API (unscoped — human-in-the-loop vs auto-approve, cost, untrusted-image
handling all undecided), a more neutral backdrop for the counter pages, and
Next.js parallel/intercepting routes for the counter's tab switches. Same day,
not doodle-wall: the waving clown NPC at the clown tent stood inside the west
barricade rail (baseline (-3.8, 18.4), ≈0.2 m from a barricade); moved
mid-walkway to (-1.8, 18.5) (spec out 2.5 / side 0.2), verified numerically
(1.33 m nearest solid) plus screenshot — branch `fix/clown-npc-placement`, PR
to follow.

2026-07-16 (earlier) — **Stage 2 merged and live; housekeeping built.** PR #69
merged to master (`f592da8`); Nick completed the config gate (Google OAuth
client, Supabase provider + URL config) and confirmed `/admin` works in
production ("This works great"). He then asked for takedown UI — the
reject-approved verdict had existed in the domain since Stage 2 but had no
surface. Built on `feature/doodle-wall-housekeeping` (merged later the same
day as PR #70): `/admin/wall` — the counter's second view — shows the wall
exactly as
hung (reuses `tileService.getWall()`, newest-first bounded 48) with a two-tap
arm/confirm Take down per tile; the shared counter shell
`src/app/admin/AdminGate.tsx` extracted (taking the parked `/admin` card-shell
dedup — both pages are now slim identity+data wrappers); the shared
`verdictClient.ts` PATCH helper so reason-gated staleness handling lives in
one place; CONTEXT.md's _carny's counter_ entry widened to two views. No
route/domain/schema changes — §2.1 untouched. Gate green, 156 tests (was 149).

2026-07-15 — **Stage 2 (moderation) built** on `feature/doodle-wall-moderation`
(merged next day as PR #69). One slice, same hexagonal shape:
`tileService.getQueue()` + `moderate()` with the verdict transition rules
(rejected is final), new `TileRepository` port methods, the server-only
`adminAuth.ts` (cookie sessions via `@supabase/ssr`, JWKS-verified claims,
hard allow-list `nick@iamnick.dev`, Google provider pin, production origin
pin), the three auth routes, `PATCH /api/admin/tiles/:id`,
`GET /api/keepalive` + the `vercel.json` daily cron, and `/admin` — the carny's
counter (four identity states, `AdminQueue` client component, noindex + robots
disallow). CONTEXT.md gained _The carny's counter_ and _Verdict_. Gate green
with 149 tests (was 120). Close-out: glossary-guard (5 findings) and
/code-review high (10 confirmed fixed — §5); five Stage 2 follow-ons parked
(§5). Earlier the same day the fix PRs merged: #67 (`0e60a41`, the e2e varlock
`SUPABASE_URL` fix) and #68 (`4631df6`, mobile framing via
`Attraction.frameWidth` + NPC re-routes).

2026-07-14 — **Stage 1 shipped end to end.** PR #65 merged (`12d4a39`) after the
close-out chain (`5a2df8d`, `c43bf60`, `b4bc279`) and Nick's board-only revision
(`4860738`). Supabase provisioned via the CLI (project **iamnick**, ref
`hzwjezozoxlopyfgmxoc`, Frankfurt); storage-listing PR #66 merged (`cbcd832`);
Nick set all four env vars (legacy JWT keys, §5); the real-Supabase e2e passed
locally — the full submit → pending → approve → wall → reject chain, anon
listing blocked, test tile retained by design (§5, §6). The e2e found the
varlock `SUPABASE_URL` leak-scan bug that would have 500'd `GET /api/wall` on
the first approved tile (§7); fixed as `6cc67f9`.

For a NEW session picking this up: read `CONTEXT.md`, then this doc top to bottom —
§2.1 has the frozen contracts, §5 the canon decisions + parked follow-ons, §8 the next
action. The `carnival-context` agent (`.claude/agents/carnival-context.md`) briefs
builders from this doc and absorbs outcomes back into it — keep that loop.
