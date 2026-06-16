# Ball-Toss Game — Build Handoff

> **Mission for the next session:** build a playable **ball-toss carnival game** at the
> existing Ball Toss booth in the isometric Dark Carnival. The visitor clicks the booth's
> indicator, the camera flies in first-person to the counter, and they throw balls to knock
> down a stack of milk bottles — score, balls-remaining, win/lose, exit back to the overview.
>
> Everything you need is below. Read it top-to-bottom before writing code. Branch: `feature/modernise`.

---

## 0. TL;DR of what to do

1. Add a `playing` entry path: when the **ball-toss** indicator is clicked, fly the camera to the
   booth (already happens) but enter **`mode: 'playing'`** instead of opening the content panel.
2. Build `<BallTossGame>` — a 3-D in-scene mini-game (ball + bottle stack + lightweight custom
   physics) that mounts inside the Canvas while `mode === 'playing' && activeStall === 'ball-toss'`.
3. Build a DOM HUD (`<BallTossHud>`) for score / balls-left / instructions / Exit.
4. Wire Exit (button + Escape) → `exit()` → camera returns to overview.
5. Verify headless (recipe in §6), run gates, commit.

**Recommended scope for v1:** in-scene first-person, **custom lightweight physics** (no new deps),
3 balls, a 6-bottle pyramid, score + "you won a prize" on full clear. Confirm with Nick before
reaching for `@react-three/rapier` (see §5 decision).

---

## 1. Current state (what already exists — do not rebuild)

The booth and its props are already placed; only the _interactivity_ is missing.

- **The booth:** `SM_Prop_Stall_02` at three-space **(13, −12)**, yaw 45°, added via
  `EXTRA_INSTANCES` in `src/components/three/synty/sceneAdditions.ts:40`.
- **A static milk-bottle stand:** `SM_Prop_Milk_Bottle_Toss_Stand_01` at **(12.3, −12.7)**, y=1.0
  (`sceneAdditions.ts:42`). This is **decoration** — the game should spawn its **own** dynamic,
  knock-down-able bottles (see §4). Decide whether to hide this static stand while playing.
- **The POI / indicator:** `attractions.ts` (`src/components/three/synty/attractions.ts:77`), id
  **`ball-toss`**, `section: 'game:ball-toss'`, `position: [13, 1.7, -12]`,
  `facing: [-0.707, 0, 0.707]` (camera sits NW of the booth, looking SE into it),
  `focusDist: 8`. The camera fly-in already frames the booth correctly.
- **Placeholder content:** `SectionContent.tsx:221` renders a `<Game title="Ball Toss" />`
  "coming soon" panel for `section === 'game:ball-toss'`. **Replace this path** — the game should
  pre-empt the content overlay, not show alongside it.
- **The store spine is already in place** (`src/store/scene.ts`): `mode: 'travelling' | 'viewing'
| 'playing'`, `activeStall`, `stepIn(stall)` (sets `mode='playing'`), `exit()` (back to
  `travelling`). **Nothing sets `playing` yet — you wire it.**
- **Assets in the GLB manifest** (`public/models/synty/`, keys in `manifest.json`):
  `SM_Prop_Milk_Bottle_01` (target bottle), `SM_Prop_Baseball_01` / `SM_Prop_Tennis_Ball_01` /
  `SM_Prop_Bowling_Ball_01` (throwables), `SM_Prop_Sign_Ball_Toss_01` (booth sign).
  Load with `useGLTF('/models/synty/<key>.glb', true)`; props use the shared atlas (see §7 note on
  texturing if a spawned prop looks wrong).

---

## 2. How the focus → mode flow works (integration map)

```
Indicator click (Indicators.tsx, drei <Html> dot)
   → useSceneStore.focus(id)               # sets focusedAttraction
        → IsoControls (IsoControls.tsx) reacts in a useEffect:
             flies camera to attraction.facing/focusDist (first-person opening view)
             after 1400ms timer → open(id)  # sets mode='viewing', activeAttraction=id
                  → ContentOverlay renders SectionContent panel
```

**What to change:** in `IsoControls.tsx` (the `useEffect` on `focused`, ~line 53–67), branch on the
attraction's section: if it `startsWith('game:')`, after the fly-in call **`stepIn(id)`**
(`mode='playing'`) instead of `open(id)`. Keep the 1.4 s fly-in delay so the camera has arrived at
the counter before the game arms. `ContentOverlay` already only renders for `mode==='viewing'`, so it
will correctly stay closed during play.

Key files & lines:

- `src/store/scene.ts` — `focus`, `open`, `close`, `stepIn`, `exit`. `close()` already resets
  `focusedAttraction`; add the same reset to `exit()` so leaving the game returns the iso camera to
  overview (today `exit()` only clears `mode`/`activeStall` — **also clear `focusedAttraction`** or the
  camera will stay parked at the booth).
- `src/components/three/synty/IsoControls.tsx` — fly-in logic; `focusedRef` drives the per-frame
  `WANT_POS/WANT_LOOK`. While `mode==='playing'` you may want the camera to **hold** at the booth
  (it already does, because `focusedAttraction` is still set). Confirm drag/zoom is disabled while
  playing (today it's disabled whenever `focusedAttraction` is set — good).
- `src/components/three/Scene.tsx` — mount `<BallTossGame />` inside the `<Canvas>` (inside the
  `<Suspense>`), it self-gates on store state.
- `src/app/page.tsx` / a new HUD — mount `<BallTossHud />` as a DOM sibling of `<ContentOverlay />`.

---

## 3. Game design spec (v1)

**Feel:** quick, satisfying, low-stakes carnival throw. ~20 s to play. Mobile + desktop.

- **Setup on enter:** camera is first-person at the counter (already framed). A **stack of 6 milk
  bottles** (3-2-1 front pyramid, or two stacks of 3) sits on the booth shelf ~3–5 m ahead. Show a
  faint **aim reticle / trajectory arc**. Balls remaining = **3**. Score = 0.
- **Controls (aim + power + throw):**
  - **Desktop:** move pointer to aim (reticle follows); **press-drag down** to charge power, the
    trajectory arc grows; **release** to throw. Or simpler: click-drag a "slingshot" vector and
    release.
  - **Mobile/touch:** swipe up to throw — swipe length = power, swipe angle = aim.
  - Pick ONE clean scheme and make it work on both; a charge-and-release with an on-screen power
    meter is the most legible. Document the chosen scheme in the component header.
- **Physics (the throw):** ball spawns at the camera, launches with an initial velocity from
  aim+power, integrates under gravity (`v += g*dt; p += v*dt`). On hitting a bottle (sphere-vs-box or
  sphere-vs-capsule), the bottle is knocked: apply impulse → it topples (linear + angular velocity,
  integrate with gravity, let it fall off the shelf). A cheap **cascade** (a toppling bottle nudges
  neighbours within radius) makes stacks feel real without full rigid-body solving.
- **Scoring:** each bottle that leaves its upright resting state = **+points** (e.g. 100). Knock a
  whole stack with one ball = small **combo bonus**. Running score in the HUD.
- **End states:**
  - **Win:** all 6 bottles down → "🎉 Winner — you knocked 'em all down!" + a prize line (tie it to
    the portfolio voice — e.g. "Prize: now go read my work →" linking to the Career booth). Offer
    _Play again_ / _Exit_.
  - **Out of balls:** show final score, _Play again_ / _Exit_.
- **Exit:** an always-visible **Exit ✕** (HUD) and **Escape** → `exit()` → camera flies back to the
  iso overview, game unmounts, bottles reset.
- **Reset/Play again:** restore bottles to the pyramid, balls=3, score=0 — no reload.

**Juice (cheap wins, add if time):** a little ball spin, bottle clack on hit, dust puff sprite,
score pop, subtle camera shake on a full clear. Keep it light — Nick is sensitive to perf/flicker.

---

## 4. Technical plan (components & data)

Create under `src/components/three/game/`:

- **`BallTossGame.tsx`** (in-Canvas). Gates on
  `useSceneStore(s => s.mode==='playing' && s.activeStall==='ball-toss')`. Owns:
  - the bottle array (positions, velocities, upright flag) held in **refs** (not React state — this
    is a per-frame sim; mutating hook returns / reading `ref.current` in render trips the
    `react-hooks/immutability` + `react-hooks/refs` lint rules — see §7).
  - the active ball ref (position, velocity, live flag).
  - `useFrame` integrator: step ball, collide vs bottles, step toppling bottles, detect rest, tally
    score (write score/balls to the store or a small dedicated zustand slice so the DOM HUD can read
    it).
  - renders `<InstancedMesh>` or individual `<primitive>` clones of `SM_Prop_Milk_Bottle_01` and the
    ball GLB. (6 bottles + 1 ball = fine as individual meshes; instancing optional.)
  - pointer handlers via R3F `onPointerDown/Move/Up` on an invisible plane, or DOM listeners on the
    canvas (mirror `IsoControls`' own pointer handling, but only while playing).
- **`BallTossHud.tsx`** (DOM, mounted in `page.tsx` next to `ContentOverlay`). Reads score / balls /
  game-phase from the store; shows instructions on first entry, the power meter (optional), Exit ✕,
  and the win/lose card with Play again / Exit. Style with the existing `hud-card` / `hud-button` /
  `hud-chip` classes + `motion/react` (same as `ContentOverlay.tsx`) for visual consistency.
- **State:** extend `src/store/scene.ts` with a minimal game slice — e.g. `ballTossScore`,
  `ballTossBallsLeft`, `ballTossPhase: 'aiming'|'thrown'|'won'|'lost'`, and actions
  (`resetBallToss`, `setBallTossScore`, …). Keep it small; the per-frame physics stays in refs in
  the component, only **summary** state (score/balls/phase) goes to the store for the HUD.

**Bottle stack placement:** booth is at three-space (13, −12), yaw 45°, facing NW. Put the bottles
on the booth's shelf/counter just inside the opening, ~1.0–1.4 m off the ground, in the booth's local
forward direction. Easiest: compute a small local frame from `attraction.facing` and lay the pyramid
out relative to `attraction.position`. Iterate the exact offsets visually (see §6) — the booth
counter height/depth needs eyeballing.

**Camera:** don't fight `IsoControls`. It already parks the camera at the booth's opening while
focused. The ball should spawn near the camera and fly toward the bottles (into the screen). If you
need a slightly different play camera, do it by tuning the ball-toss attraction's `facing`/`focusDist`
rather than overriding the controls.

---

## 5. Key decision to confirm with Nick before building

**Physics library.** No physics dep is installed today (`@react-three/rapier` is NOT present;
`maath` is, for easing). Two options:

- **(Recommended) Custom lightweight physics** — projectile + sphere/box collisions + simple
  toppling. No new dependency, no WASM, full control, lowest flicker/perf risk (Nick's hard
  constraint this whole project has been "no black flicker / no lag"). Bottles topple with a hand
  rolled integrator; good enough for a ball-toss.
- **`@react-three/rapier`** — realistic rigid-body toppling out of the box, but adds a WASM physics
  dep + bundle weight + a new failure surface. Only worth it if Nick wants very realistic stacks.

**Default to custom unless Nick asks for Rapier.** Either way, keep the sim deterministic-ish and
cheap; cap substeps.

Other things worth a quick confirm: 3 balls vs unlimited-timed; the "prize" copy/links; whether the
static `Milk_Bottle_Toss_Stand` decoration stays visible behind the dynamic bottles.

---

## 6. How to verify (headless — this is the established method)

Local Chrome on Nick's Mac is the source of truth, but you can and should self-verify headless first.

**Setup (once):** `npx playwright install chromium` (the recurring `Node.js v24.13.0` crash on
`require('playwright')` just means the binary is missing — install fixes it).

**Run the app:** Nick usually runs `pnpm dev` on `:3000`. **Do NOT `rm -rf .next` while a `pnpm dev`
server is running** — it corrupts the running server's module graph and it will silently serve stale
compiled code (this burned a whole debugging cycle: symptom = JSON/data changes show but TSX changes
don't). For your own verification, either use the running dev server (HMR picks up your edits) or run
a **separate clean prod build**: `pkill -f "next start"; lsof -ti :3000 | xargs -r kill -9; rm -rf
.next; pnpm build && pnpm start`. When iterating a prod build, **always `rm -rf .next` first** or you
get 500 stale-chunk errors (JS served as `text/plain`, canvas never mounts). Restart Nick's `pnpm
dev` clean when you hand back.

**Screenshot script** (Playwright + swiftshader):

```js
import { chromium } from 'playwright';
const b = await chromium.launch({
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
});
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(16000); // scene load; cold prod build needs longer
// ... interact ...
await p.screenshot({ path: '/tmp/shot.png' });
await b.close();
```

Then **Read** the PNG. (Swiftshader renders the scene faithfully enough for layout/lighting; final
look is Nick's call.)

**Driving the iso camera deterministically** (to frame the booth at three-space (13, −12)):
pan target starts at three `(-2,-10)`, `dist0=38`, `k=dist*0.0016`; ground basis
`RIGHT=(-0.707,0,0.707)`, `FWD=(-0.707,0,-0.707)`; `panTarget += RIGHT*(-dx*k)+FWD*(-dy*k)`.
To centre world `(tx,tz)`: `aPb=-(tx+2)/0.707`, `aMb=(tz+10)/0.707`, `a=(aPb+aMb)/2`,
`b=(aPb-aMb)/2`, drag `dx=-a/k, dy=-b/k` (start a mouse drag at canvas centre, move by (dx,dy), then
wheel to zoom). **Better for the game:** click the ball-toss **indicator** to enter play directly —
query `.iso-indicator` Html elements, or just call into the store from the page console
(`window`-exposed in dev) if you add a hook. The booth is on the **east** side (three x=+13, z=−12).

**Gates (must pass before commit):** `pnpm typecheck` · `pnpm lint` · `pnpm test:ci` (29 tests) ·
`pnpm build`. The husky pre-commit runs `eslint --fix` + `prettier --write` via lint-staged.

---

## 7. Codebase gotchas you WILL hit

- **R3F lint rules are strict.** `react-hooks/immutability` and `react-hooks/refs` fail the build if
  you mutate a hook's return value or read `ref.current` **during render**. For the per-frame sim:
  create refs in-scope, mutate them only inside `useFrame`/handlers, build any ShaderMaterial uniforms
  inline in `useMemo`, and reach uniforms via a ref on the mesh inside `useFrame`. The R3F/`three`
  JSX-prop lint exception is already configured for `src/components/three/**`.
- **No `frameloop` surprises.** `Scene.tsx` runs `frameloop={high ? 'always' : 'demand'}`. On the
  **low** tier it renders on demand — your `useFrame` sim must call `invalidate()` (from `useThree`)
  each frame while the ball/bottles are moving, or the low-tier scene freezes mid-throw. (AnimatedRides
  does exactly this.)
- **No EffectComposer / post-processing.** It was removed this project (it caused a black flicker).
  Don't add bloom back. Glowing things use emissive + the additive sprite system in `BulbGlow.tsx`.
- **Black props = black `COLOR_0` vertex colours.** If a spawned game prop (bottle/ball) renders pure
  black, it's the vertex-colour multiply: set `material.vertexColors = false`. `InstancedPrefab`
  already does this for scene props, but your **game** meshes are loaded separately, so apply the same
  on the cloned material. (Also `flipY=false`, `SRGBColorSpace` if you wire the shared atlas.)
- **`demo-instances.json` has custom one-line-per-transform formatting** — never
  `JSON.parse`→`JSON.stringify` it (minifies to one line, 3000-line diff). Edit single transforms with
  a surgical text replace. (You probably won't touch it for the game, except maybe to remove the static
  milk-bottle stand from `sceneAdditions.ts`.)
- **Conversion → three coords:** Unity `(px,py,pz)` → three `(px, py, −pz)`; `cm→m` scale baked in
  `InstancedPrefab`. The `at(x,z,yawDeg,y)` helper in `sceneAdditions.ts` already takes **three-space**
  x/z and flips z for you — reuse its convention for any new placements.
- **Commit messages** end with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. Branch is
  `feature/modernise`; PRs target `master`.

---

## 8. Suggested build order (each step independently verifiable)

1. **Wire the mode switch.** `IsoControls` → `stepIn` for `game:` sections; `exit()` also clears
   `focusedAttraction`. Verify: clicking the booth indicator no longer opens the content panel and the
   camera holds at the booth; Escape/Exit returns to overview. (Stub `<BallTossGame>` returns null.)
2. **Spawn the bottle pyramid** at the booth and get it sitting on the counter correctly (visual
   iterate the offsets). No physics yet.
3. **Throw + projectile + ball-vs-bottle hit** (bottle just disappears/falls on hit). Get the aim/power
   input feeling right on desktop + touch.
4. **Toppling + cascade + scoring** + balls-remaining.
5. **HUD** (score/balls/instructions/Exit) + **win/lose** cards + **Play again**.
6. **Juice** (optional) — sfx/dust/score-pop/clear shake.
7. Gates + commit; ask Nick to confirm feel on his Mac.

Keep each step a small commit. Verify headless after 2–3, and hand Nick a build to feel after the
core loop (step 4–5) — physics _feel_ is hard to judge from screenshots.

---

## 9. What was just finished (context, already committed on `feature/modernise`)

The scene cleanup that preceded this is done & committed (latest `be39e5e`): black flicker removed
(no EffectComposer), ride bulbs lit (emissive mipmaps off) + flicker-free additive bulb-glow halos
(`BulbGlow.tsx`/`bulbGlowExtract.ts`), under-lit props fixed (lifted fill light), grey bins removed,
the black props (candyfloss cart / carnival train / mine carts / pie-wall / dunk tank) fixed via
`material.vertexColors = false`, pie-wall + dunk-tank + dive-tower rotations. **One parked item:** the
"picket signs with light bulbs face the wrong way" request — only 2 bulb signs render (the rest sit in
the filtered origin-pile); Nick is to send a screenshot pinpointing which signs he means, then rotate
them 180° (flip the quat about Y in `demo-instances.json`). Not a blocker for the game.
