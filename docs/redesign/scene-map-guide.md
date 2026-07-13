# Scene Map — authoring NPC & walker placements on a 2D grid

> **What this is.** A top-down ASCII grid of the real carnival scene that you edit
> to place NPCs and walker paths, instead of guessing float coordinates in code.
> Built July 2026 (commit `00ed2ff`) on branch `feature/fortune-teller`. For a
> new agent: this is the intended way to move crowd/walkers around — prefer it
> over hand-editing coordinates in `Npcs.tsx`.

## The three files

| File                                              | Role                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `docs/redesign/scene-map.txt`                     | The map **you edit**. A generated top-down backdrop of structures + your placement annotations, in one grid. |
| `scripts/scene-map.mjs`                           | The tool. `generate` (redraw backdrop, keep annotations) and `parse` (annotations → JSON).                   |
| `src/components/three/synty/scenePlacements.json` | Generated output. `Npcs.tsx` reads it; **do not hand-edit**.                                                 |

## Workflow (the normal loop)

1. Open `docs/redesign/scene-map.txt`.
2. Move/add/remove **annotation characters** (see key below) on the grid.
3. Run: `node scripts/scene-map.mjs parse`
4. Reload the app — the scene uses your new placements.

That's it. No coordinate math, no screenshots. Ask the agent to run step 3 if you
don't want to, then it updates the scene.

## Reading the map

- Grid = the explorable field: three-space **x ∈ [−32, 32]** (columns, +x = east /
  right) × **z ∈ [−40, 40]** (rows, −z = north / top). **1 character = 2.5 metres.**
- The iso camera views from the **top-left corner (−x, −z)**, so "toward the
  viewer / front of a booth" is up-and-left on the map.
- Row labels show the z of each row; the header shows the x range.

### Backdrop characters (reference only — `generate` redraws these)

```
F ferris wheel   O carousel      T teacups       S swings
U bumpers        I high-striker  D dive tower     ~ dive pool
E entrance arch  C big top        Z fortune wagon
n stall / tent / building         % tree / bush    (space) open ground
```

Small scatter (grass, leaves, stones, misc props) is treated as **walkable** and
left blank, so open ground actually reads. Only rides, buildings, tents and trees
are drawn as obstacles.

### Annotation characters (what YOU place, on open cells)

**NPCs** — one character = one standing NPC at that cell's centre. Facing is
automatic: greeters face **away** from the nearest structure, spectators face
**toward** it.

```
k  Carny (barker, faces out)        j  Clown male (waving, faces out)
v  Visitor male (clapping, in)      r  Ringleader (cheering, faces out)
l  Visitor male (looking, in)       x  Visitor female (happy idle, in)
```

**Walker loops** — a stroller follows a closed loop through ordered waypoints:

```
1 2 3 4 …9   loop A, walked in numeric order
a b c d …i   loop B, walked in letter order
```

Place at least 3 waypoints for a loop to render. Walkers are **high-tier only**
(a walker frozen on the power-saving mobile frameloop looks broken; mobile keeps
the static NPCs).

## What the grid can and can't do

**Can:** which area, which side of a booth, rough spacing, facing, walker routes.
This is ~90% of placement work and kills the blind-coordinate guessing.

**Can't (these stay in code, in `Npcs.tsx`):**

- **Fine sub-cell offsets** — "0.5 m left of the counter." A cell is 2.5 m.
- **Height (Y).** The grid is flat ground. The **dive-board diver** is therefore
  NOT on the map — she's an `EXPLICIT` placement in `Npcs.tsx` at 8.25 m, and is
  always added on top of whatever the map produces.
- **Per-NPC scale.**

## How the wiring works (for the agent)

- `Npcs.tsx` imports `scenePlacements.json`. If its `npcs` array is non-empty it
  is the source of truth; otherwise the attraction-derived baseline (`DERIVED` /
  `NPC_SPECS`) renders. Same for `walkers` vs `WALKERS_BASELINE`. The `EXPLICIT`
  diver is always concatenated.
- The JSON was **seeded from the current scene**, so it's populated and live now —
  editing the map + `parse` is what changes things going forward.
- `generate` merges: it redraws the backdrop from `demo-instances.json` but
  **preserves any annotation characters** already in the map, so it's safe to
  re-run after scene/prop changes without losing your placements.
- `docs/redesign/scene-map.txt` is in `.prettierignore` (prettier would wreck the
  fixed-width grid). Don't remove that.
- Adding a new NPC role or a third walker loop = extend `ROLES` / `LOOP_*` in
  `scripts/scene-map.mjs` (annotation chars must stay disjoint from the backdrop
  set and each other).

## Extending later (not built yet)

- **General placement** — the same grid could author props, tickets, lamps (any
  x/z thing), by adding roles + wiring. Deferred; scope was NPCs + walkers.
- **Live HTML editor (`?map=1`)** — click-to-place, drag paths, live scene update,
  export JSON. Nicer UX, real build; only worth it if you author a lot.

## Quick reference

```bash
node scripts/scene-map.mjs generate   # redraw backdrop, keep your annotations
node scripts/scene-map.mjs parse      # annotations -> scenePlacements.json
```

Then reload the app. Gates as always: `pnpm typecheck && pnpm lint && pnpm test:ci`.
