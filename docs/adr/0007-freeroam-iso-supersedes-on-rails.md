# Free-roam isometric exploration supersedes the on-rails spine

Status: accepted (2026-07-13) — supersedes ADR-0004

ADR-0004 locked an on-rails, scroll-driven camera along the Midway and parked
free-roam. That decision was reversed in practice during the carnival
overhaul: the shipped site is an isometric, drag-to-explore scene
(`IsoControls` — drag pans, wheel/pinch zooms, indicator click flies the
camera to an attraction and opens its overlay). The scroll spine, its
`ScrollDriver`, and the first-person rig were retired and deleted in the
standards refactor (Phase 1, `docs/refactor-plan.md`).

Why the reversal stuck: on-rails scroll fought the letterpress overlay design
(scroll had to be stolen from panels), demanded a hand-tuned spline through a
dense scene, and made the games' step-in/exit transitions jarring. The iso
camera makes every attraction reachable in any order, matches the "explore a
fairground at night" fiction, and let attraction data (`synty/attractions.ts`)
become the single source for indicators, fly-ins, nav and lighting.

The Midway remains the domain term for the street of attractions — it is now
explored freely rather than travelled linearly. `mode: 'travelling'` in the
store survives as the name of the default explore mode (glossary-sanctioned).
