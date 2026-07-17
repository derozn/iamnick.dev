# 0009 — Fluid type and space via Utopia for the iamnick brand

Status: accepted (2026-07-16) — rescoped same day by ADR-0011

[Utopia](https://utopia.fyi/) fluid type and space scales — `clamp()`-based custom properties that interpolate across the viewport — become the type/space system of the **iamnick brand**: the blog, future routed content pages, `StaticCv`, and the carny's counter (per the brand map in ADR-0011). The Dark Carnival keeps its existing fixed px tokens (`--font-size-12`…`--font-size-80`, `--spacing-0`…`--spacing-20`) as part of its self-contained identity. Both systems live in the Tailwind v4 `@theme` block in `src/styles/globals.css`, namespaced apart (brand tokens carry a distinct prefix).

## Why

The long-form reading template needs fluid type — a fixed scale that suits the carnival HUD reads either cramped on a phone or shouty on a wide screen for article prose, and per-breakpoint overrides are the thing Utopia exists to delete. The original acceptance of this ADR was site-wide adoption; Nick corrected it the same day when ruling the carnival a self-contained entity (ADR-0011). Scoping Utopia to the iamnick brand deletes the riskiest slice of the original plan outright: no live carnival surface is ever migrated.

## Considered options

- **Site-wide adoption** — briefly accepted, then rejected via ADR-0011: with two deliberate identities, forcing one underlying scale onto the carnival buys consistency nobody sees and reintroduces a risky migration of live surfaces for no brand benefit.
- **Blog-only fluid scale** — rejected: the scale belongs to the brand, not to one route; StaticCv and the carny's counter adopt the same system when they rebrand.
- **Extend the fixed scale with larger prose sizes** — rejected: more px steps is more of the problem, and long-form reading is exactly where fixed steps fail.

## Consequences

- Two token systems coexist in `@theme` permanently and on purpose; the brand tokens are namespaced so neither system can silently reference the other. An ESLint/review convention keeps carnival components off brand tokens and vice versa.
- There is no migration stage for live carnival surfaces — the old Stage 3 of the build workflow is deleted (see `docs/blog/agentic-workflow.md`).
- Scale parameters (viewport range, steps, type/space pairing) are set during brand discovery and tuned on the blog reading template, the brand's first shipped surface.
- `StaticCv` and the carny's counter move onto the brand tokens in a follow-on rebrand sweep, a separate workstream from the blog build.
