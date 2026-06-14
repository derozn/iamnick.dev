# The Midway — scene layout map

> The physical design of the Dark Carnival scene: a **linear first-person walk down a neon midway street** at night, stalls and tents lining both sides, a ferris wheel glowing through fog at the far end. This maps the world out **before** the content spine and HUD are layered on. Reference: Synty POLYGON Horror Carnival promo (atmosphere + density), tuned to **atmospheric, not gory** (figures allowed, no blood/jump-scares — see ADR-0005, revised).

## Camera & navigation (ADR-0004 — on-rails)

- **First-person, eye level.** Camera height ≈ 1.65 m, FOV ≈ 68°.
- **On a rail.** Document scroll progress `0 → 1` maps to forward travel down the street centreline (`z ≈ +2 → −58`). No free-roam, no controls to learn.
- **Walk feel.** A gentle S-curve drift in X (±0.8) and a subtle damped head-bob/sway so it reads as _walking_, not dollying. Look direction is forward down the street, easing toward points of interest.
- Demand frameloop preserved — motion (and therefore rendering) only happens while scrolling / damping settles.

## Coordinate system

- Ground plane at `y = 0`. Forward = **−Z** (camera walks into the scene).
- Street runs `z = +2` (behind the start) → `z ≈ −64` (ride plaza).
- Clear walking path ≈ 6 units wide (camera weaves within ±1). Structures line the sides at `x ≈ ±4.5`, facing **inward** toward the path. Fences/edges at `x ≈ ±6.5`.
- Props are **normalised** (scaled to a target size, base dropped to `y = 0`) so placement is just `position + yaw` — see `CarnivalProp`.

## Zones (front → back)

| z range   | Zone             | Left (x−)                         | Right (x+)                        | Overhead / centre                                  |
| --------- | ---------------- | --------------------------------- | --------------------------------- | -------------------------------------------------- |
| 0 … −4    | **Entrance**     | welcome neon sign                 | ticket booth                      | **Carnival entrance arch** spanning the path (z−2) |
| −8 … −24  | **Games row**    | stall · striped tent · can-toss   | high striker · stall · ring-toss  | bunting + string lights across                     |
| −26 … −40 | **Food & tents** | big-top tent · candyfloss cart    | fortune-teller tent · hay/barrels | bunting; balloons                                  |
| −46 … −64 | **Ride plaza**   | **ferris wheel** (hero, set back) | merry-go-round                    | the destination — glows through fog                |

**Dressing threaded throughout:** fence segments lining both edges (instanced), lamp posts every ~8 z, string-light poles, scattered balloons / barrels / hay bales, neon signage on stalls, a few **static figures** (animatronic + carny silhouettes) standing among the stalls for life and unease.

## Lighting (neon-noir night)

- **Fog** is the headline: deep indigo (`#0e0b1a`), near ≈ 6 / far ≈ 50, so the street fades into night and the ferris wheel reads as a glowing silhouette.
- **Moon key:** dim cool directional from high front (`#9fb4ff`).
- **Hemisphere fill:** low, cool sky over warm-violet ground.
- **Warm stall pools:** a warm point light (`#ffb066`) inside each stall/tent — the inviting glow that punches through the fog.
- **Lamp posts:** small warm points along the street.
- **Neon:** all signage + ride trim is emissive (`toneMapped off`); **Bloom** makes it bleed. Magenta/cyan accents on the rides.
- **Ground:** dark, low-key; the warm pools and lamp light pick it out.

## Atmosphere

- Fog motes / dust drifting low over the street (re-purposed `SpaceDust`, denser near the ground).
- Optional later: distant music-box ambience, flicker on a couple of bulbs (deferred — see open-questions Audio).

## Build order for this pass

1. **Engine:** first-person rail camera, night fog, ground, neon-noir light rig.
2. **Models:** convert the neutral funfair + ride + dressing set (FBX→GLB, neutral/non-gory only).
3. **Dress the street** data-driven (`carnival.config.ts` placements: per item `model · position · yaw · zone`).
4. **Figures:** added once the environment reads right (rigs export T-pose — they need posing so they don't look broken; done deliberately, not dropped).

Content sections + HUD are intentionally **out of scope** this pass — the page is reduced to a scroll-spacer so the scene can be judged on its own. The content spine and HUD return when we map sections onto street positions.
