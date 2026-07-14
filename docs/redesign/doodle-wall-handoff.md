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

**Before any feature code:** the `/grill-with-docs` session (§5) must close the open
parameters. Its outcomes land in `doodleWallConfig.ts` and §5 of this doc.

## 1. Current state (verified 2026-07-14)

- **Nothing of the doodle wall exists yet.** No route, no component, no store slice, no
  attraction entry. `src/app/api/` contains only `fortune/`; `src/lib/` is flat utilities
  plus `fonts/`.
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

| Piece                              | Path                                                                             | Stage |
| ---------------------------------- | -------------------------------------------------------------------------------- | ----- |
| SQL migration (tiles, RLS, bucket) | `supabase/migrations/…`                                                          | 1     |
| Domain: types, ports, service      | `src/lib/doodle-wall/`                                                           | 1     |
| Supabase clients + adapters        | `src/lib/supabase/`                                                              | 1     |
| Submit route (thin)                | `src/app/api/tiles/route.ts`                                                     | 1     |
| Wall route (thin, cacheable)       | `src/app/api/wall/route.ts`                                                      | 1     |
| Tuning config (three-free) + tests | `src/components/three/game/doodleWallConfig.ts`                                  | 1     |
| In-scene stall + tile grid         | `src/components/three/game/DoodleWall.tsx`                                       | 1     |
| Drawing overlay                    | `src/components/overlays/DoodleWallHud.tsx`                                      | 1     |
| Store slice                        | `src/store/scene.ts` (extend)                                                    | 1     |
| Attraction entry                   | `src/components/three/synty/attractions.ts` (extend)                             | 1     |
| Env vars                           | `.env.schema` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) | 1     |
| Admin queue page                   | `src/app/admin/page.tsx`                                                         | 2     |
| Approve/reject route               | `src/app/api/admin/tiles/[id]/route.ts`                                          | 2     |
| Keepalive route + cron             | `src/app/api/keepalive/route.ts` + Vercel cron                                   | 2     |

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

**Open:**

- Admin queue UX details (batch approve, preview size) — resolve at Stage 2 start.
- Exact stall placement on the Midway (after contact, per CONTEXT.md order) — iterate
  visually during the scene slice.

**Needs Nick (human gates):**

- Provision the Supabase project and set the three env secrets (local + Vercel) before
  Stage 1 goes live. Until then everything runs against a stub/fake adapter.
- Stage 2 admin allow-list uses Nick's actual Google identity — collect it at Stage 2
  start; never widen to "any Google login" (ADR-0001).
- Final look/feel judgement on his Mac (real GPU).

## 6. How to verify

- **Gate (every slice):** `pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`.
- **Domain:** unit tests for `tileService` against in-memory fakes (pending-forced-on-
  submit, bounded wall query, size cap). Config helpers in `doodleWallConfig.test.ts`.
- **Routes:** handler tests — rate-limit rejects flooding, invalid payload 400s, wall
  returns approved only.
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
- Commit messages end `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## 8. Build order

1. ~~Grill session closes §5 open decisions~~ ✅ done 2026-07-14; outcomes in §5.
2. Domain layer + fake adapters + unit tests (no Supabase needed). Server truths (tile
   dims, byte cap, wall/scene bounds, rate limits) live in `src/lib/doodle-wall/` and are
   re-exported by `doodleWallConfig.ts` for scene/overlay use — one source, both sides
   three-free.
3. Routes (thin) against the fake adapter; stub mode akin to `FORTUNE_STUB`.
4. Scene: attraction entry + stall + wall grid fed by `/api/wall` (stub data).
5. Overlay: drawing surface + submit flow + store slice.
6. Swap in real Supabase adapter behind the ports once Nick provisions (gate).
7. Close-out: glossary-guard → /code-review (high) → docs-scribe → absorb here.
8. Stage 2: admin + keepalive, same shape.

## 9. What just happened

2026-07-14 — Plan approved (`~/.claude/plans/i-want-to-do-effervescent-parasol.md`);
`feature/doodle-wall` branched from a clean master (`9360f16`); `carnival-context` agent
created; this doc seeded. Grill session then closed every open parameter (§5) and synced
`open-questions.md`. Next: Stage 1, backend slice first (§8 step 2–3), then scene slice.
