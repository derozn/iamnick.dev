# The Midway — scene layout map

> The physical design of the Dark Carnival scene: a **first-person walk that enters down a short neon avenue and opens into a plaza** ringed with stalls, tents and rides — the ferris wheel glowing at the back, the carnival's bustle laid out around you. Trees frame it in a dark field; lamps and string lights are lit; it glows like a fairground at night, not a void. Maps the world out **before** the content spine and HUD are layered on. Reference: Synty POLYGON Horror Carnival promo (atmosphere + density), tuned to **atmospheric, not gory** (figures allowed, no blood/jump-scares — see ADR-0005, revised).
>
> Live layout lives in `src/components/three/carnival.config.ts` (CAMERA_PATH/LOOK_PATH + PLACEMENTS/LAMP/FLAG arrays) — tune the scene there. Verified via headless screenshots (entrance → avenue → plaza reveal → plaza centre).

## Camera & navigation (ADR-0004 — on-rails)

- **First-person, eye level.** Camera height ≈ 1.7 m, FOV ≈ 70°.
- **On a rail, choreographed.** Scroll progress `0 → 1` samples two CatmullRom curves: `CAMERA_PATH` (position) walks in down the avenue and arcs into the plaza centre; `LOOK_PATH` (gaze) pans across the plaza and settles on the ferris wheel — so you "arrive" and survey the bustle. No free-roam, no controls to learn.
- **Walk feel.** A subtle head-bob (derived from progress) sells the walk; position + gaze are critically damped so nothing snaps.
- **Frameloop:** high tier renders continuously so the string lights twinkle (the carnival feels alive); low tier stays demand-driven (renders only while scrolling) to save battery.

## Coordinate system

- Ground plane at `y = 0`. Forward = **−Z** (camera walks into the scene).
- Street runs `z = +2` (behind the start) → `z ≈ −64` (ride plaza).
- Clear walking path ≈ 6 units wide (camera weaves within ±1). Structures line the sides at `x ≈ ±4.5`, facing **inward** toward the path. Fences/edges at `x ≈ ±6.5`.
- Props are **normalised** (scaled to a target size, base dropped to `y = 0`) so placement is just `position + yaw` — see `CarnivalProp`.

## Zones (front → back)

| z range   | Zone          | Layout                                                                                                                                                          |
| --------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| +8 … −2   | **Entrance**  | **Carnival arch** spanning the path, welcome sign, ticket booth; fences funnel you in.                                                                          |
| −4 … −24  | **Avenue**    | A tight neon corridor — striped stall + tent, candyfloss cart, lamp posts, bunting + string lights overhead — leading inward.                                   |
| −28 … −56 | **Plaza**     | Opens out: stalls, tents and games ring the centre (x ≈ ±8–10) **facing inward**; floor scattered with benches, stools, hay, barrels, balloons, plushies, food. |
| −56 … −64 | **Ride bank** | Closes the plaza: **ferris wheel** (hero, back-centre), merry-go-round + teacup ride flanking, high striker behind.                                             |

**Around it:** trees / bushes / rocks frame the carnival in a dark field (x ≈ ±10–17). Lamp posts ring the plaza (bulbs lit + warm pools), string-light strands twinkle overhead, bunting spans across. **Figures** (animatronic / carny) are the remaining add — deferred until posed (the rigs export T-pose).

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
