# Dark Carnival — build status & handoff

> **Start here for a new session.** Current state of the v2 Dark Carnival scene, how it's built, how to change it, and what's next. Companion to `PLAN.md` (roadmap), `CONTEXT.md` (glossary), `scene-layout.md` (the scene map), and the ADRs (locked decisions).

## Where we are

Phase 1 (the immersive 3-D home) is in active build on branch **`feature/modernise`**. The homepage is currently a **scene-evaluation build**: just the 3-D carnival + a scroll spacer — **no HUD / content yet** (deliberately deferred; the DOM section components still exist for when the spine returns).

The scene is a **first-person, on-rails walk** down a **textured dirt road** through a **structured fairground**: entrance arch → games section → food section → **plaza ringed with rides** (ferris wheel closing it). Stalls/tents line the road in **neat rows facing it**; foliage frames the field. Night, neon, fog, twinkling string lights. **Atmospheric, not gory** (ADR-0005 revised — figures allowed, no blood/gore).

Decisions locked with Nick this round: **atmospheric+figures (no gore)**, **first-person on-rails**, **road-with-rows structure + plaza** (not a scattered field). Reference: the Synty POLYGON Horror Carnival promo, toned non-gory.

## How it's built (files)

All under `src/components/three/`:

- **`carnival.config.ts`** — the scene as DATA, and the **one place to tune layout**. Exports: `CAMERA_PATH` / `LOOK_PATH` (the on-rails curves), `MODELS` (GLB url map), `PLACEMENTS` (core props — rows + plaza + stall interiors), `DENSE_PLACEMENTS` (fillers + foliage, high-tier only), `FLAG_PLACEMENTS`, `LAMP_PLACEMENTS`, `FENCE_PLACEMENTS`. Helpers: `face(x,z)` (yaw toward plaza centre `C`), `ROT_LEFT/RIGHT` (rows face the road). A `Placement` = `{ model, position:[x,y,z], rotationY, size, warm? }`. `size` is the **largest normalised dimension** (props are auto-scaled to it and dropped to the ground).
- **`FirstPersonRig.tsx`** — samples the two CatmullRom curves by scroll progress → eye-level camera position + gaze, damped, with a progress-driven head-bob.
- **`CarnivalStreet.tsx`** — renders PLACEMENTS (all tiers) + DENSE/FENCE (high tier) + warm pool lights on `warm` stalls + lit lamp posts + ride accents + StringLights + dust + bloom.
- **`attractions/CarnivalProp.tsx`** — loads a GLB, **normalises** it (scale to `size`, recentre X/Z, base on ground) so placement is just position+yaw. Draco via `useGLTF(url, true)`.
- **`shared/Ground.tsx`** — grass plane + a **textured dirt road** (real Synty `ground-dirt` tiles down the spine) + a dirt **plaza circle** (`ground-dirt-round`). `GroundTile` places ground GLBs at a **raw scale** (not normalised — tiles keep real size).
- **`shared/StringLights.tsx`** — one instanced mesh of emissive bulbs in catenary sags that **twinkle** (per-bulb flicker; animates on high tier).
- **`shared/SceneLighting.tsx`** — ambient + moon key + hemisphere + (high) magenta rim + tiny Lightformer env. **Brightness lives here** + `Scene.tsx` `toneMappingExposure`.
- **`Scene.tsx`** — Canvas: fog, camera, AgX tone-map. **`frameloop` = `always` on high tier** (so lights twinkle) / `demand` on low. **`SpaceDust.tsx`** = sparse fog motes (kept subtle per feedback).
- **`MidwayCanvas.tsx`** — `dynamic(ssr:false)` shell; `useQualityTier` gates high/low/none (none = no canvas, reduced-motion/no-WebGL).
- Store: **`src/store/scene.ts`** (`useSceneStore`: mode/activeStall/progress/sections + stepIn/exit) — the spine for future step-in games.

## Asset pipeline (add/convert models)

**70 GLBs** live in `public/models/carnival/` (~7.7 MB; each embeds its atlas — see Optimisations). Source pack: `~/Documents/Assets/POLYGON_Horror_Carnival_SourceFiles_v3.zip` (FBX). **Neutral/non-gory assets only** (ADR-0005).

Tooling is **arm64-native** (the npm `fbx2gltf` binary is x86 + Rosetta absent): **`assimp`** (`brew install assimp`) + **`@gltf-transform/cli`**. Working dir **`/tmp/cv_test`** holds `assimp`, the atlas textures in `tex/`, and **`rewrite.mjs`** (maps the FBX's baked broken Windows atlas paths → the local atlas; `.psd`/missing → `_A.png`; **drops unresolvable texture slots** like stray cross-pack normal maps).

Per model: `assimp export X.fbx out.gltf` → `node rewrite.mjs out.gltf` → `gltf-transform optimize out.gltf out.glb --compress draco --texture-compress webp --texture-size 512` (1024 for hero props). Then `cp` into `public/models/carnival/` and add to `MODELS`. **Verify** the new prop is Y-up/upright via its bbox (gltf-transform `inspect`). Some props convert tiny/untextured (e.g. `popcorn`, `table`, `milk-toss`) — their material didn't resolve; skip them.

## How to self-verify the scene (no eyes on a live canvas)

Headless WebGL screenshots — this is how every pass was checked:

```
pnpm build && pnpm start           # serve the prod build on :3000
node /tmp/shot/shot.mjs            # Playwright/chromium, swiftshader, scrolls + screenshots
# then Read the PNGs in /tmp/shot/
```

`shot.mjs` launches chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, waits for load, scrolls to 4 points (entrance / avenue / plaza-enter / plaza), screenshots each. Tweak `carnival.config.ts`, rebuild, re-shoot.

## Verify / quality gates

`pnpm typecheck` · `pnpm lint` · `pnpm test:ci` (29 Vitest) · `pnpm build` — all green. Pre-commit (husky/lint-staged) runs eslint --fix + prettier.

## Done

- First-person on-rails engine; scene-state store; FBX→GLB pipeline (70 neutral GLBs).
- Structured fairground: dirt-road spine + neat stall rows + sections + plaza of rides + foliage frame + dressed stall counters.
- Night lighting (lit lamps, warm pools, neon, bloom, twinkle); textured ground; brightness + particle density tuned to feedback.
- ADR-0005 revised (figures ok, no gore); `CONTEXT.md` register updated; `scene-layout.md` is the scene map.

## Next (proposed, to plan step-by-step with Nick)

1. **Figures / people** — the remaining "bustle". Synty character rigs export **T-pose**; they need posing before use (don't drop in raw). Decide a posing approach (Mixamo/Blender pose, or pick animatronics that are modelled posed).
2. **Lay out the content spine** — map the CV sections (Header/About, Career Highlights earliest→present, Side Projects, Contact — components already built) onto positions/stops along the road, and bring the **HUD** back over the walk. Re-enable the real DOM in `app/page.tsx` (currently a scroll spacer).
3. **Polish** — ride rotation/animation for life (needs isolating ride sub-meshes), audio (deferred), camera pacing.
4. Later phases (PLAN.md): blog (MDX/SSG), ball-toss (Rapier), doodle wall (Supabase).

## Optimisations to consider

- **Model payload (~7.7 MB):** every GLB embeds its own copy of the shared Synty atlas. Dedup via **one external atlas** (strip embedded textures, apply a shared `useTexture` map in `CarnivalProp`) → could cut models to <1 MB. Watch UV flipY/colorSpace.
- **Draw calls / instancing:** repeated props (fences, foliage, barrels) use `<Clone>` (one draw call each); switch heavy repeats to instancing if perf needs it.
- **Continuous frameloop** on high tier costs GPU even when idle — fine for desktop wow; revisit for battery.
