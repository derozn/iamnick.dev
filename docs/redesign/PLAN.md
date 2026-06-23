# iamnick.dev v2 — The Dark Carnival (Master Plan)

> Living plan for the v2 redesign. Read alongside `CONTEXT.md` (glossary), `docs/adr/0001–0005` (locked decisions), `docs/redesign/architecture.md` (how it's built), and `docs/redesign/open-questions.md` (what's still undecided). Vocabulary in this doc is defined in `CONTEXT.md` — use those words.

## Vision

A single, scroll-driven 3D experience set in a **Dark Carnival**: a stylish-abandoned neon funfair at night — faded tents, quiet stalls, flickering bulbs, neon glow in the fog. **Cool and atmospheric, never horror.** The visitor travels the **Midway** on-rails as they scroll, passing the attractions of Nick's career and two optional games. The goal is **wow + demonstrated creativity to land a senior/lead front-end-leaning engineering role** — while staying perfectly fast, accessible, and indexable.

This is an **evolution of the current build, not a rewrite of its tech.** The underlying plumbing (R3F canvas, scroll→camera rig, quality tiers, typed content, CVA/Tailwind v4, Vitest, CI) is reused. The **visual design and scene content are replaced** (the v1 neon-noir city look is retired).

## Locked decisions (see ADRs / CONTEXT.md)

- **World:** Dark Carnival, stylish-abandoned, no horror. Neon kept. (ADR-0005)
- **Navigation:** on-rails scroll-driven camera; free-roam game parked for a future edition. (ADR-0004)
- **Content:** content-first DOM; 3D is a decorative enhancement; full no-WebGL/reduced-motion fallback. (ADR-0003)
- **Site shape:** immersive home `/` + conventional routed pages behind a global nav; blog is a separate non-3D MDX/SSG template. (ADR-0002)
- **Doodle wall backend:** Supabase (Postgres + Storage + Google OAuth), tiled, persisted-not-live, pre-moderation queue. (ADR-0001)
- **Profiles:** **Full** (desktop/pointer) gets everything incl. ball-toss; **Lite** (mobile/touch) gets the same scene at reduced fidelity, ball-toss becomes scenery, doodle wall stays fully usable. (CONTEXT.md)

## The Midway (attraction order)

| #   | Attraction            | Type         | Notes                                                                                                 |
| --- | --------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| 1   | **Header / Entrance** | exhibit      | Opening of the scene; name, title, short bio (About folded in here). LCP = real `<h1>`.               |
| 2   | **Career Highlights** | exhibit      | Work history as a run of role attractions (tents/stalls), earliest→present. From `src/content/cv.ts`. |
| 3   | **Ball-toss**         | stall (game) | Step-in. Full only; scenery on Lite.                                                                  |
| 4   | **Side Projects**     | exhibit      | Podback, Eversys, etc. Separate from Career Highlights.                                               |
| 5   | **Contact**           | exhibit      | Links only (email, LinkedIn, GitHub, CV). Reached by nav anchor.                                      |
| 6   | **Doodle wall**       | stall (game) | Step-in. Full + Lite (view + draw). Supabase-backed.                                                  |

Global nav: `Home · Work · Play · Blog · Contact` — Work/Play/Contact are hash anchors to attractions on `/`; **Blog** is the only real route jump.

## Per-feature design

### Header / Entrance

Carnival entrance moment (gate / ticket booth / archway — exact form is an open question). Real `<h1>` "Nick de Rozarieux" + title + one-line bio, server-rendered (LCP element). A scroll cue invites travel down the Midway.

### Career Highlights

Each role rendered as its own neon-lit attraction the camera travels past, built from neutral Synty carnival props (tents/booths) + neon. Content (company, dates, highlights, tech) is **real DOM** over/beside the prop, driven from `src/content/cv.ts`. Staging (one attraction per role vs a single pavilion housing all roles) is an **open question**.

### Ball-toss (Full only)

Throw a ball at stacked tins. **Real physics** via a lazy-loaded engine (Rapier — `@react-three/rapier`), loaded **only on step-in** so it never touches the initial/mobile bundle. **Drag-to-aim-and-throw.** Local-only: score + "knock all tins" win + neon celebration + a cheeky line. **No leaderboard, no persistence.** On Lite: the tin stall is lit scenery with a "Best on desktop" tag, no Play button.

### Side Projects

Exhibit of side projects from `src/content/cv.ts` (Podback w/ link, Eversys), external links `rel="noopener"`, visually marked external.

### Contact

Links only — `mailto`, LinkedIn, GitHub, CV download — as HUD-style targets (≥44px). No form, no `/contact` page (deferred; can add later).

### Doodle wall (Full + Lite)

A grid of neon "polaroid" **tiles** showing the most recent **approved** contributions. Step in → draw in your own tile → submit → it enters the **pre-moderation queue**. Persisted, not live. Drawing works on both profiles (touch + pointer). Backend per ADR-0001. See `architecture.md` for data shape, endpoints, moderation, rate-limiting, keepalive.

### Blog (separate route, no 3D)

`/blog` + `/blog/[slug]`, sleek fast neon-styled reading template, **no live canvas**. **MDX files in `content/blog/`** + frontmatter, statically generated. Per-post SEO: metadata, auto OG image, `Article` JSON-LD, sitemap, RSS. Primary indexable-text/SEO surface of the site.

## Mobile / quality tiers

Reuse and extend `useQualityTier` (`high | low | none`). Map to profiles: **Full** ≈ high (capable pointer device), **Lite** ≈ low (phone/touch — reduced DPR, bloom off/cheap, fewer lights, simpler props), **none** = reduced-motion/no-WebGL → static styled fallback with full content. Interactive ball-toss gated on `pointer: fine` + viewport/tier; everything visual scales by tier.

## SEO

- Home: content-first DOM (all role/project/contact text is real SSR HTML); in-scene neon labels are `aria-hidden` decorative duplicates. Metadata, OG image, `Person` JSON-LD, sitemap, robots (already exist in v1 — keep/extend).
- Blog: the heavy SEO engine — SSG, per-post metadata + OG + `Article` JSON-LD + RSS.
- Targets: LCP = the `<h1>` (not canvas); CLS ~0 (canvas is fixed behind flowing DOM); blog Lighthouse SEO/Best-Practices ~100.

## Phased roadmap (build order; public launch after all phases)

> No incremental public launch — **build all of v2, then go live.** WOW before blog. Each phase is independently mergeable and leaves the app working.

1. **Phase 1 — Carnival reframe + Career Highlights + global nav.** The centrepiece. Retire v1 city look; bring in Dark Carnival lighting/assets; rebuild the work-history attractions; add the nav. _(Asset pipeline work starts here — see architecture.md.)_
2. **Phase 2 — Blog.** MDX pipeline, `/blog` routes, reading template, per-post SEO, RSS. Independent of the 3D.
3. **Phase 3 — Ball-toss stall.** Rapier (lazy, desktop-only), drag-throw, local win celebration.
4. **Phase 4 — Doodle wall + Supabase.** Tables/storage/auth, submit + wall + admin-approve endpoints, drawing UI, moderation view, rate-limit + keepalive. The only phase with persistent infra — done last.
5. **Launch.** CV PDF in place, Vercel + DNS, final QA (desktop + 390px, keyboard, screen reader, Lighthouse), go live with full v2.

## Reuse vs replace

| Reused (keep)                                                                                                                                                                                                          | Replaced / retired                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R3F canvas + `Scene`/`JourneyCanvas` shell, `ScrollDriver`, scroll→camera rig, `useQualityTier`, neon/bloom material + post-fx, `journey.config.ts` pattern, typed `src/content`, CVA + Tailwind v4 tokens, Vitest, CI | v1 city/island visual design + cyberpunk GLBs, the descending camera path's content, the "career islands"/"journey" framing (→ Midway/attraction vocabulary; files may be renamed) |

## Future (parked)

- **v-next free-roam mode:** an optional walkable/playable-game route layered on the accessible site (ADR-0004). Not in this build.
- A dedicated `/contact` page if a form is ever wanted.
