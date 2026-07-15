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
> Stage 1 merged and live (PRs #65–#68). Stage 2 built on
> `feature/doodle-wall-moderation` (working tree; PR to follow). PRs target
> `master`.

---

## 0. TL;DR of what to do

Two stages, each its own PR:

1. **Stage 1 — visitor path:** ✅ **complete, LIVE-VERIFIED end to end, and fully
   merged.** PR #65 (`12d4a39`), storage-listing PR #66 (`cbcd832`), e2e varlock
   fix PR #67 (`0e60a41`) and mobile-framing PR #68 (`4631df6`) all on master;
   Supabase provisioned, all four env vars set, real-Supabase e2e passed (§6).
2. **Stage 2 — moderation:** ✅ **BUILT** (2026-07-15) on
   `feature/doodle-wall-moderation` (working tree, **PR to follow**): `/admin` —
   the carny's counter — over the pre-moderation queue (Supabase Auth, Google
   OAuth, hard allow-list `nick@iamnick.dev` only), verdict route, daily
   keepalive cron. Gate green, 149 tests, close-out chain done. `/admin` stays
   in its "unconfigured" state until Nick does the Google OAuth config —
   **§5 Needs Nick is the gate.**

## 1. Current state (verified 2026-07-15, `feature/doodle-wall-moderation` over master `4631df6`)

**Stage 1 is merged, provisioned, and live-verified end to end. Stage 2
(moderation) is BUILT** — staged/working-tree on this branch, gate green
(typecheck / lint / test:ci with 149 tests keyless / build), close-out chain
done, **PR to follow**. `/admin` renders its "unconfigured" state until Nick
does the Google OAuth config (§5 Needs Nick).

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

**Stage 2 (this branch, built 2026-07-15, staged/working tree):**

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
- **Tests:** 149 total (was 120 pre-Stage-2): tileService queue + verdict rules,
  adminAuth allow-list, PATCH route (guards + verdicts), keepalive, `AdminQueue`
  component. Gate green; stub-mode `/admin` smoke-tested by portrait screenshot.
- **Close-out chain done:** glossary-guard (5 findings → counter/verdict renames +
  the CONTEXT.md entries) and /code-review high (24 candidates → 10 confirmed,
  all fixed; list in §5).

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
| The carny's counter (page + queue)  | `src/app/admin/page.tsx` + `AdminQueue.tsx`                                                | 2     | ✅ built (working tree)                             |
| Verdict route                       | `src/app/api/admin/tiles/[id]/route.ts`                                                    | 2     | ✅ built (working tree)                             |
| Auth routes (login/callback/logout) | `src/app/api/admin/auth/*/route.ts`                                                        | 2     | ✅ built (working tree)                             |
| Admin auth (server-only)            | `src/lib/supabase/adminAuth.ts` (allow-list, provider pin, origin pin)                     | 2     | ✅ built (working tree)                             |
| Keepalive route + cron              | `src/app/api/keepalive/route.ts` + `vercel.json`                                           | 2     | ✅ built (working tree)                             |

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

**Parked follow-ons (verified in review, deliberately not fixed — pick up post-merge):**

- **(Stage 2)** Atomic transition port method — a single conditional UPDATE instead
  of `findById` + `setStatus` (the `setStatus` write is unconfirmed against the
  read; the race window is Nick-vs-Nick, so parked).
- **(Stage 2)** Rate limiting on the admin auth routes.
- **(Stage 2)** Pin session cookie flags explicitly rather than inheriting
  `@supabase/ssr` defaults.
- **(Stage 2)** `requireModerator()` route-preamble helper — extract when a second
  admin route appears.
- **(Stage 2)** Card-shell dedup across `/admin` + the `AdminQueue` empty state —
  joins the existing `CardShell` follow-on below.

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

**Needs Nick (human gates):**

- **Stage 2 config gate — `/admin` cannot work until this is done:**
  1. Google Cloud Console (console.cloud.google.com/auth/clients): create an
     OAuth client (web application), Authorized redirect URI =
     `https://hzwjezozoxlopyfgmxoc.supabase.co/auth/v1/callback`.
  2. Supabase dashboard → Auth → Providers → Google: enable, paste the client ID
     - secret.
  3. Supabase dashboard → Auth → URL Configuration: Site URL
     `https://iamnick.dev`; add to the redirect allow-list
     `https://iamnick.dev/api/admin/auth/callback` and
     `http://localhost:3000/api/admin/auth/callback`.
  4. RECOMMENDED: disable the email/password provider (defence in depth — the
     provider pin already blocks it).
  5. Optionally set `CRON_SECRET` in the Vercel env.
  6. Then the Stage 2 e2e per §6: sign in on the phone → a pending tile appears
     at the counter → approve → on the wall; a non-allow-listed account → denied.
- **Real-GPU look pass** on the freestanding board (outstanding since `4860738`,
  including the mobile fly-in framing on a real phone) — headless swiftshader
  can't judge colour/glow; also eyeball the error cards, the `#doodle-wall` hash
  entry, and now the carny's counter styling (§6).

## 6. How to verify

- **Gate (every slice):** `pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`
  — all green at the Stage 2 head (149 tests, keyless).
- **Domain + routes + config:** ✅ covered by colocated unit tests against fakes —
  Stage 2 added tileService queue + verdict rules, adminAuth allow-list, PATCH
  route guards + verdicts, keepalive, and the `AdminQueue` component.
- **The carny's counter, stub mode:** ✅ smoke-tested by portrait screenshot
  (unconfigured state renders; no auth possible pre-config).
- **Scene/overlay headless:** recipe in `ball-toss-game-handoff.md` §6 (Playwright +
  swiftshader, `?debug=1` + `window.__sceneStore`; `?off=doodle` isolates the wall).
  ✅ Re-verified at `4860738`: fly-in frames the freestanding board (grid + bulbs +
  fence behind) and the board reads from the travelling view past the big top
  (scripts: `/tmp/shot/doodle-board.mjs`, `doodle-area.mjs` — uncommitted rig).
  Framing changes need a **portrait shot too** (390×844 viewport): the whole 6×4
  grid, bulbs and both poles must sit in frame during the fly-in — ✅ verified
  2026-07-15 with `frameWidth: 3.6`, desktop unchanged. Still unexercised
  visually: the new error cards and the `#doodle-wall` hash entry.
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
- **Stage 2 end-to-end (after Nick's config gate, §5):** sign in at `/admin` on
  the phone with the allow-listed account → a submitted tile appears at the
  counter as `pending` → approve → it reaches `GET /api/wall`; reject an approved
  tile → it leaves the wall (takedown); a non-allow-listed Google account →
  denied; `GET /api/keepalive` → `{ ok: true, mode: 'live' }` (with the bearer
  token if `CRON_SECRET` is set).
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
12. ~~Stage 2: admin + keepalive~~ ✅ **built 2026-07-15** on
    `feature/doodle-wall-moderation` (staged/working tree; gate green, 149 tests;
    glossary-guard + /code-review close-out done — §1, §5).
13. **← YOU ARE HERE:** (a) raise the Stage 2 PR → (b) **Nick's config gate**
    (§5 Needs Nick: Google OAuth client, Supabase provider + URL config, optional
    `CRON_SECRET`) → (c) the Stage 2 end-to-end check (§6). In parallel, Nick's
    real-GPU look pass on the board is still outstanding (since `4860738`).

## 9. What just happened

2026-07-15 (latest) — **Stage 2 (moderation) BUILT** on
`feature/doodle-wall-moderation` (staged/working tree; PR to follow). One slice,
same hexagonal shape: `tileService.getQueue()` + `moderate()` with the verdict
transition rules (rejected is final), new `TileRepository` port methods, the
server-only `adminAuth.ts` (cookie sessions via `@supabase/ssr`, JWKS-verified
claims, hard allow-list `nick@iamnick.dev`, Google provider pin, production
origin pin), the three auth routes, `PATCH /api/admin/tiles/:id`,
`GET /api/keepalive` + the `vercel.json` daily cron, and `/admin` — the carny's
counter (four identity states, `AdminQueue` client component, noindex + robots
disallow). CONTEXT.md gained _The carny's counter_ and _Verdict_. Gate green
with 149 tests (was 120); stub-mode `/admin` smoke-tested by portrait
screenshot. Close-out done: glossary-guard (5 findings) and /code-review high
(10 confirmed fixed — §5); five new Stage 2 follow-ons parked (§5). **Nothing
works at `/admin` in production until Nick's config gate (§5 Needs Nick):**
Google OAuth client + Supabase provider/URL config, then the Stage 2 e2e (§6).
Earlier the same day the fix PRs merged: #67 (`0e60a41`, the e2e varlock
`SUPABASE_URL` fix) and #68 (`4631df6`, mobile framing via
`Attraction.frameWidth` + NPC re-routes) — master is `4631df6`.

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
