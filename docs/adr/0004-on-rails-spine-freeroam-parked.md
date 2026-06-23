# 0004 — On-rails (scroll-guided) spine now; free-roam game parked for a future edition

The Dark Carnival is navigated **on-rails**: native document scroll drives a camera that travels the Midway and performs cinematic arrivals (e.g. walking up to and into an attraction), with optional **step-in** games at the stalls. We deliberately are **not** building a free-roam, walkable avatar in this edition.

## Why

The site's first duty is getting Nick's experience read quickly by hiring managers. A free-roam game adds control-learning friction on the critical path, is far harder to make crawlable and screen-reader accessible (conflicts with [ADR-0003](./0003-content-first-dom.md)), is clunky on touch (conflicts with the Lite profile), and is a substantially larger build. On-rails delivers the "moving through a world" wow with **zero controls to learn, full mobile support, and content as real DOM**.

## Considered options

- **Full free-roam avatar** (walk the world, enter buildings) — the purest "fun/game" expression and a proven attention-getter (e.g. Bruno Simon's portfolio), but rejected for this edition on friction / SEO / mobile / scope grounds above.

## Consequences

- A future **"v-next" edition** may add a free-roam / playable-game mode as a **new optional route** layered on top of the accessible version — never the only path to content. This is explicitly **parked, not rejected**.
- Camera movement is scripted from scroll progress (reuses the existing scroll→camera rig). No character controller, collision, or navmesh in this edition.
