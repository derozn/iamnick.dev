# iamnick.dev v2 — Open Questions

> What's **not** yet decided. The spine is locked (see `PLAN.md` + ADRs); these are the finer details to resolve during build or in a follow-up grilling session. Grouped by system. Each has a leaning where I have one.

## Carnival scene / Career Highlights

- **Career Highlights staging** — one attraction _per role_ along the Midway (distributed; matches v1 islands), or a single "Career Highlights" pavilion the camera enters that houses all roles (centralised; closer to Nick's "walk into a venue" image)? _Lean: per-role attractions for the on-rails travel feel; revisit if 7 roles + education feels too long._
- **Header / Entrance form** — carnival gate? ticket booth? archway under a neon sign? What exactly is the first beat that "starts the scene"?
- **Career Highlights on Lite (mobile)** — how 7 roles + education stage without feeling endless on a phone; do earlier roles condense?
- **Earlier-roles condensation** — full attraction each, or a condensed "earlier roles" cluster for Lyvly/Yoti/Arcadia/Vitamin (as v1 did)?

## Ball-toss

- Scoring detail, number/arrangement of tins, throw-power tuning.
- The exact "cheeky line" / reward on win.
- Camera framing for the stall on Lite (scenery state).

## Doodle wall

- ~~Tile size, wall bound + age-out, drawing tools, rate-limit values + `submitter_hash`
  basis, tile frame visual, display surface~~ ✅ **Resolved** (grill session 2026-07-14) —
  decisions recorded in `doodle-wall-handoff.md` §5.
- Admin queue UX details (batch approve, preview size) — resolve at Stage 2.

## Blog

- Content location: `content/blog/` vs `src/content/blog/` (pick one, stay consistent).
- MDX tooling choice (e.g. `@next/mdx` vs `next-mdx-remote` vs a compile step) — implementation detail for Phase 2.
- Categories/tags taxonomy, and whether tag pages exist at launch.

## Cross-cutting

- **Audio** — ambient carnival sound (distant music-box, hum) + SFX (tin clatter, doodle pen)? Opt-in/muted-by-default? Not yet discussed; likely a nice-to-have, default off. _Lean: defer, design mute-first if added._
- **Analytics** — any privacy-friendly analytics (Plausible/Vercel) to measure the job-search funnel? Not yet discussed.
- **Performance budget numbers** — concrete targets per tier (initial JS KB, LCP ms, FPS floors). To be set at Phase 1.
- **Asset pipeline specifics** — FBX→GLB tool (Blender vs FBX2glTF), Draco vs meshopt, texture atlasing, per-prop budget.
- **Synty licence confirmation** — verify WebGL/web-embedding is covered before relying on the pack in production.
- **File/dir renames** — whether to rename existing `journey*`/`island*` code to `midway`/`attraction` vocabulary, or leave as-is and only align new code. _Lean: align new code; rename opportunistically, not as a dedicated task._

## Content Nick still owes (from v1, still outstanding)

1. **CV PDF** at `public/cv/nick-de-rozarieux-cv.pdf` (Download CV link).
2. Any **personal about-me copy** beyond the résumé profile (now folded into the Header).
3. **Supabase project** creation + Google OAuth app + his admin email allow-listed.
4. **Vercel** project + iamnick.dev DNS when ready to launch.
5. ~~Purchase the **Synty Horror Carnival** pack~~ ✅ **Acquired** — at `~/Documents/Assets/` (use `POLYGON_Horror_Carnival_SourceFiles_v3.zip`, the FBX source). Used as neutral lumber only.

## Parked (decided not-now)

- **Free-roam playable-game mode** — a future "v-next" route (ADR-0004). Not in this build.
- **Leaderboard** for the ball-toss (would reopen backend/abuse scope).
- **Dedicated `/contact` page / form.**
