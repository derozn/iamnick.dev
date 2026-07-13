# Ball-Toss Game — As-Built & Fine-Tuning Handoff

> **Status: built and playable.** The playable ball-toss carnival game is implemented end-to-end
> (steps 1–5 of `ball-toss-game-handoff.md`) and committed on `feature/modernise`. This doc is the
> companion to that original spec: it describes **what exists now**, **how it works**, and **how to
> fine-tune / extend it** in a fresh session. Read this top-to-bottom before touching the game.
>
> The thing left to do is **feel-tuning** (throw arc + hit forgiveness) on a real machine — see §4 —
> plus the optional follow-ups in §7.

> **Update — throw is now a slingshot (supersedes the charge-and-release scheme below).**
> The original "point-to-aim + hold-to-charge" was replaced with an Angry-Birds-style
> **slingshot**: a ready ball sits in the pouch; press and **drag back** to set power (pull
> distance) and aim (pull direction — the ball fires _opposite_ the pull); release to throw; a
> live arc + reticle preview the shot; a tap under `PULL_DEADZONE` cancels. `CHARGE_TIME` is gone;
> new knobs `PULL_FULL` / `AIM_YAW` / `AIM_LOFT` / `POUCH_NDC` / `LAUNCH_DIST` / `PULL_WORLD` are in
> `ballTossConfig.ts`. Crucially the launch sits **above + ~4 m from** the stack, so the throw is
> near-flat: **`LAUNCH_LIFT 0.25→0.05`, `AIM_LOFT → 0`** (loft made shots sail over). The HUD also
> moved to the letterpress theme — see `hud-letterpress-overhaul.md`. Where the §2/§4 text below
> still says "charge", read "pull".

---

## 0. TL;DR

- Click the **Ball Toss** booth indicator → camera flies in → a **how-to card** → throw 3 balls at a
  6-bottle pyramid → score / win / lose / play again / exit.
- **Custom lightweight physics, no dependencies** (Rapier was declined). Projectile under gravity +
  sphere-vs-cylinder hits + hand-rolled toppling/cascade.
- All gameplay lives in `src/components/three/game/`. **Feel knobs are labelled constants in
  `ballTossConfig.ts`** (§4) — that's where 90% of fine-tuning happens.
- Commits on `feature/modernise` (each step independently verified, gates green):

  | Step | Commit    | What                                                                      |
  | ---- | --------- | ------------------------------------------------------------------------- |
  | 1    | `d10cc68` | step-in mode wiring + store slice + HUD shell                             |
  | 2    | `0192f8a` | milk-bottle pyramid on the counter (+ cleared 2 props from the play zone) |
  | 3    | `3d19b80` | throw — aim + charge-and-release, projectile, hit detection               |
  | 4    | `b952aa3` | topple + directional cascade + scoring + combo                            |
  | 5    | `71b51a1` | HUD — how-to / winner / out-of-balls cards + Play again                   |

- **`pnpm build` was intentionally NOT run** during the build (it clobbers a running `pnpm dev`'s
  `.next`). typecheck · lint · test:ci are green at every commit. Run the build gate at handback on a
  restarted server.

---

## 1. Files & architecture

```
src/components/three/game/
  ballTossConfig.ts   — booth frame (FACING/FORWARD/SIDE), STACK_ANCHOR, pyramid layout,
                        and ALL tunable physics/scoring constants. Single source of truth.
  BallTossGame.tsx    — in-Canvas. The whole sim: bottle assets, ball asset, pointer input,
                        per-frame integrator (ball + bottles), collisions, scoring. Self-gates
                        on store state; mounts <Sim> only while playing the ball-toss booth.
src/components/overlays/
  BallTossHud.tsx     — DOM overlay. Score/balls chip, Exit ✕, aiming hint, and the modal
                        cards (intro / won / lost) + Play again. Reads summary state only.
                        (Moved out of three/game/ in refactor Phase 2 — HUDs live in overlays/.)

Touched elsewhere:
  src/store/scene.ts                       — ball-toss slice (score/balls/phase/round) + actions
  src/components/three/synty/attractions.ts — `ball-toss` POI: play-camera focusDist/position
  src/components/three/synty/IsoControls.tsx— game: sections call stepIn() after the fly-in
  src/components/three/Scene.tsx            — mounts <BallTossGame/> inside <Suspense>
  src/app/page.tsx                          — mounts <BallTossHud/> beside <ContentOverlay/>
  src/components/content/SectionContent.tsx — dropped the dead "coming soon" game panel
  src/components/three/synty/demo-instances.json — removed 2 props in the play zone (§8)
```

**Data flow.** The per-frame sim runs entirely in **refs** inside `<Sim>` (R3F lint forbids mutating
hook returns / reading `ref.current` in render). Only **summary state** — `ballTossScore`,
`ballTossBallsLeft`, `ballTossPhase` — is written to the Zustand store, which the DOM HUD subscribes
to. The HUD never touches the physics; the sim never renders DOM. They meet only at the store.

---

## 2. How it plays (entry flow, controls, phases)

**Entry.** Clicking the `ball-toss` indicator → `useSceneStore.focus('ball-toss')` → `IsoControls`
flies the camera to the booth and, because the section starts with `game:`, calls **`stepIn('ball-toss')`**
(`mode='playing'`) after the 1.4 s fly-in (instead of opening a content panel). `<BallTossGame>` and
`<BallTossHud>` both self-gate on `mode==='playing' && activeStall==='ball-toss'`.

**Controls — one scheme, mouse + touch:** _point to aim · hold to charge · release to throw._
The launch direction is the **camera ray** through the pointer, lobbed upward by `LAUNCH_LIFT`
(the play camera looks slightly down, so a raw point-and-throw fires low). Power charges while held
(`CHARGE_TIME` to full) and maps to launch speed `MIN_SPEED…MAX_SPEED`. An in-scene **trajectory arc
and landing reticle** preview the shot while aiming.

**Phases** (`ballTossPhase`, drives the HUD):

- `intro` — how-to card, shown on entry. "Start throwing" → `aiming`.
- `aiming` — armed; pointer aims, charge-and-release throws. Arc preview visible.
- `thrown` — a ball is in flight / bottles settling; input parked.
- `won` — all 6 down → winner card (+ prize link to the Career booth).
- `lost` — out of balls with bottles standing → out-of-balls card.

**Exit.** `✕` (HUD) or **Escape** → `exit()` → clears `focusedAttraction` so the iso camera eases
back to the overview; `<Sim>` unmounts. **Play again** (`replayBallToss()`) resets in place without
leaving the booth (§5).

---

## 3. The physics model

All in `BallTossGame.tsx`, integrated in `useFrame`. The sim calls `invalidate()` every active frame
so the **demand frameloop** (low quality tier) keeps stepping mid-throw.

**Throw.** On release: `vel = liftedDir(camera, pointerNDC) * speed`, spawned at the camera position.
`liftedDir` = unproject the pointer to a world ray, then `dir.y += LAUNCH_LIFT`, renormalise.

**Ball integration — substepped.** Each frame the ball integrates in fixed `H = 0.004 s` substeps
(`while remaining > 0`). This is essential: a fast ball moves ~0.3 m/frame at 60 fps, far more than
the ~0.1 m bottle radius, so without substepping it **tunnels straight through** the stack. Substeps
keep each move ~1.6 cm.

**Collision — sphere vs upright cylinder**, per standing bottle, per substep:
`withinY` (ball y inside `[base.y − ballR − HIT_FUDGE, base.y + bottleH + ballR + HIT_FUDGE]`) AND
horizontal distance `< bottleR + ballR + HIT_FUDGE`. `HIT_FUDGE` is the **forgiveness** knob (the
bottles are tiny). On a hit: `knock(i)` and the ball keeps `HIT_DAMPING` of its speed so one ball can
clip several. Ball retires below `FLOOR_Y` or past `MAX_RANGE`.

**Topple.** Each bottle is a tiny rigid body (`BottleSim`: base, pos, vel, quat, axis, spin, up,
resting). `knock` sets `up=false`, shoves it horizontally along the ball's path (`KNOCK_PUSH`) with an
upward pop (`KNOCK_UP`) and a tumble (`KNOCK_SPIN`, about the horizontal axis ⟂ the shove). Knocked
bottles integrate under gravity in `stepBottles`; once one falls below `SETTLE_Y` it's `resting` and
hidden. (They currently fall **off the shelf and vanish** — see §7 if you want them to settle in view.)

**Cascade — directional.** A toppling bottle nudges standing neighbours within
`CASCADE_RADIUS_FACTOR × spacing` **only if they're ahead in its fall direction** (`dx·fallX + dz·fallZ > 0`).
This is deliberate: the bottles are packed closer than the cascade radius, so a non-directional
cascade would chain through the whole connected pyramid and **auto-clear on any contact**. Directional
cascade topples a _fan_, preserving challenge. Cascade nudges use `CASCADE_PUSH_FACTOR` of the force.

**Scoring.** `POINTS_PER_BOTTLE` per knock; a `CLEAR_COMBO_BONUS` if one ball topples ≥ `COMBO_MIN_HITS`
(applied on ball-retire). Win = 0 standing; lose = 0 balls with bottles standing.

---

## 4. Fine-tuning surface — **the feel knobs** (`ballTossConfig.ts`)

This is the main thing left to do. Tweak, save (HMR picks it up), feel it, repeat. Nothing here needs
a rebuild.

| Constant                                                     | Now            | Raise it →                                            | Lower it →                          |
| ------------------------------------------------------------ | -------------- | ----------------------------------------------------- | ----------------------------------- |
| `GRAVITY`                                                    | −8             | flatter, faster-dropping arc (more negative = harder) | floatier, higher lob                |
| `MIN_SPEED` / `MAX_SPEED`                                    | 8 / 14         | throws reach further / flatter                        | shorter, more arc-dependent         |
| `LAUNCH_LIFT`                                                | 0.25           | aim point sits lower (more lob)                       | aim more directly where you point   |
| `CHARGE_TIME`                                                | 0.85 s         | slower power build (more deliberate)                  | twitchier charge                    |
| `HIT_FUDGE`                                                  | 0.08           | **more forgiving** hits (stickier)                    | **stricter**, near-misses fail      |
| `HIT_DAMPING`                                                | 0.72           | ball ploughs further through a stack                  | ball stops sooner after a hit       |
| `KNOCK_PUSH` / `KNOCK_UP` / `KNOCK_SPIN`                     | 1.8 / 0.7 / 12 | bottles fly harder / pop higher / spin faster         | gentler topple                      |
| `CASCADE_RADIUS_FACTOR`                                      | 1.7            | cascades reach more neighbours                        | tighter, fewer chain knocks         |
| `CASCADE_PUSH_FACTOR`                                        | 0.7            | cascaded bottles fly nearly as hard as direct hits    | weak nudges                         |
| `SETTLE_Y`                                                   | −0.4           | bottles vanish sooner                                 | bottles fall further before despawn |
| `POINTS_PER_BOTTLE` / `CLEAR_COMBO_BONUS` / `COMBO_MIN_HITS` | 100 / 250 / 3  | scoring / combo balance                               | —                                   |

**Play camera** (frames the stack) is tuned via the `ball-toss` entry in `attractions.ts`
(`focusDist: 5.2`, `position: [13.35, 1.12, -11.0]`) — per the original doc's "tune the attraction,
don't fight IsoControls." The **stack placement** is `STACK_ANCHOR = (13.45, 0.84, -10.95)` in
`ballTossConfig.ts`. If you move either, re-check framing (§6).

> The current values were tuned against an **offline simulation** of the exact play camera (§6), which
> can find the hittable aim/power region but cannot judge _feel_. Expect to nudge `GRAVITY`,
> `*_SPEED`, `LAUNCH_LIFT`, and `HIT_FUDGE`.

---

## 5. State model (`src/store/scene.ts`)

Ball-toss slice (summary only — the sim owns the per-frame state):

```ts
ballTossScore: number;
ballTossBallsLeft: number;
ballTossPhase: 'intro' | 'aiming' | 'thrown' | 'won' | 'lost';
ballTossRound: number; // bumped by replayBallToss(); the sim watches it
setBallToss(patch); // sim writes score/balls/phase
resetBallToss(); // full reset to the intro card
replayBallToss(); // Play again: score 0, balls 3, phase 'aiming', round++
```

**Reset model.** Entering the booth mounts `<Sim>`, whose mount effect sets `phase='intro'` + score 0

- balls 3. A second effect keyed on `ballTossRound` rebuilds the `sims` array **and restores the
  bottle group visuals** (position = base, quaternion = identity, visible = true) — necessary because
  the sim mutates those groups directly. "Play again" calls `replayBallToss()` (bumps the round →
  that effect re-runs) without unmounting. `exit()` also clears `focusedAttraction` (so the camera
  leaves the booth).

---

## 6. Headless verification recipe (and the gotchas that will bite you)

Local Chrome on the Mac is the source of truth, but you can self-verify headless. **These gotchas cost
real time the first time around — read them.**

1. **Quality tier → no canvas.** Headless Chromium defaults to `prefers-reduced-motion: reduce`, which
   makes `useQualityTier` return `none` → the canvas never mounts. Always launch the page with
   `newPage({ reducedMotion: 'no-preference' })`.

2. **Frame-starvation.** On the high tier the canvas uses `frameloop='always'`, but **headless rAF
   does not tick continuously** — a single `screenshot()` catches the camera fly-in barely started and
   the physics frozen mid-throw. **Pump frames**: loop `await page.screenshot(); await wait(ms)` — each
   screenshot forces one frame. ~14 pumps settles the fly-in (watch `camDist → focusDist`); ~30 plays
   out a topple. On the real machine this is all smooth; it's purely a headless artifact.

3. **Indicators are inside the `aria-hidden` canvas wrapper** → Playwright `getByRole` skips them.
   Click them by class: `page.locator('.iso-indicator', { hasText: 'Ball Toss' })`. The HUD and modal
   cards are outside the wrapper, so `getByRole('button', { name: ... })` works there.

4. **Don't `pnpm build` (or `rm -rf .next`) while `pnpm dev` is running** — it corrupts the dev
   server's module graph and it silently serves stale compiled code (TS changes stop applying while
   JSON/data changes still do — a very confusing failure). Iterate on the dev server (HMR); run the
   build gate only on a stopped/restarted server.

**Frame-pumped screenshot harness** (`/tmp/shoot.mjs`):

```js
import { chromium } from 'playwright';
const out = process.argv[2] || '/tmp/bt.png';
const clip = process.argv[3]; // "x,y,w,h"
const b = await chromium.launch({
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
});
const p = await b.newPage({
  viewport: { width: 1600, height: 900 },
  reducedMotion: 'no-preference',
});
await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(15000); // scene load
await p.locator('.iso-indicator', { hasText: 'Ball Toss' }).first().click();
for (let i = 0; i < 14; i++) {
  await p.screenshot({ path: '/tmp/_settle.png' });
  await p.waitForTimeout(350);
} // settle fly-in
const opts = { path: out };
if (clip) {
  const [x, y, w, h] = clip.split(',').map(Number);
  opts.clip = { x, y, width: w, height: h };
}
await p.screenshot(opts);
await b.close();
```

To **drive a throw**: `mouse.move(x,y)` (aim) → `mouse.down()` → pump a few frames (charge) →
`mouse.up()` → pump frames (flight). Read the HUD via
`document.querySelector('.hud-chip').textContent`. NB: in headless the charge tends to **max out**
(slow screenshots make the "hold" >1 s), so partial-power throws are hard to reproduce there.

**Offline trajectory tuner** — the fast way to map the hittable aim/power region without a browser.
Rebuilds the exact play camera (PerspectiveCamera + lookAt + unproject) and the integrator. Run from
the repo root (so `three` resolves):

```js
import { PerspectiveCamera, Vector3 } from 'three';
const L = new Vector3(13.35, 1.12, -11.0); // attraction position (look target)
const facing = new Vector3(-0.707, 0, 0.707).normalize(),
  fd = 5.2;
const C = L.clone()
  .addScaledVector(facing, fd)
  .add(new Vector3(0, fd * 0.16, 0)); // = play-camera pos
const cam = new PerspectiveCamera(34, 1600 / 900, 0.5, 400);
cam.position.copy(C);
cam.up.set(0, 1, 0);
cam.lookAt(L);
cam.updateMatrixWorld(true);
cam.updateProjectionMatrix();
const STACK = new Vector3(13.45, 0.84, -10.95),
  SIDE = new Vector3(facing.z, 0, -facing.x).normalize();
const bottleR = 0.05,
  bottleH = 0.219,
  ballR = 0.06,
  spacing = bottleR * 2 + 0.012,
  rise = bottleH * 0.96;
const rows = [3, 2, 1],
  bottles = [];
rows.forEach((c, r) => {
  for (let i = 0; i < c; i++) {
    const o = (i - (c - 1) / 2) * spacing;
    bottles.push(
      STACK.clone()
        .addScaledVector(SIDE, o)
        .add(new Vector3(0, r * rise, 0)),
    );
  }
});
const GRAVITY = -8,
  MIN = 8,
  MAX = 14,
  LIFT = 0.25,
  FUDGE = 0.08;
const lifted = (ny) => {
  const d = new Vector3(0, ny, 0.5).unproject(cam).sub(C).normalize();
  d.y += LIFT;
  return d.normalize();
};
function sim(ny, speed) {
  const p = C.clone(),
    v = lifted(ny).multiplyScalar(speed);
  let hits = 0;
  const k = new Set();
  for (let t = 0; t < 3; t += 0.004) {
    v.y += GRAVITY * 0.004;
    p.addScaledVector(v, 0.004);
    for (let i = 0; i < bottles.length; i++) {
      if (k.has(i)) continue;
      const b = bottles[i];
      const dx = p.x - b.x,
        dz = p.z - b.z;
      if (
        p.y > b.y - ballR - FUDGE &&
        p.y < b.y + bottleH + ballR + FUDGE &&
        Math.hypot(dx, dz) < bottleR + ballR + FUDGE
      ) {
        k.add(i);
        hits++;
      }
    }
    if (p.y < -0.5 || p.distanceTo(L) > 14) break;
  }
  return hits;
}
for (const ny of [-0.3, -0.15, 0, 0.15, 0.3, 0.45]) {
  let r = 'ny=' + ny.toFixed(2) + ' ';
  for (const pw of [0, 0.25, 0.5, 0.75, 1]) r += ' p' + pw + ':' + sim(ny, MIN + (MAX - MIN) * pw);
  console.log(r);
}
// `ny` is pointer NDC-y (screen-y = (1-ny)/2 * 900); `pw` is charge fraction. Keep bottleR/H/ballR in
// sync with the runtime if you change the assets. Use this to re-centre the hit region after a tune.
```

**Gates before any commit:** `pnpm typecheck` · `pnpm lint` · `pnpm test:ci`. The husky pre-commit runs
`eslint --fix` + `prettier --write`. (`prettier --write` on `demo-instances.json` is SAFE — its
one-line-per-transform format already matches prettier output; just never `JSON.parse→stringify` it.)

---

## 7. Known issues & follow-ups (for the next session)

- **Aim arc + reticle preview — never visually confirmed.** It's wired (`updateAim`, an `InstancedMesh`
  of dots + a ring), but the headless demand-frameloop starves it, so I couldn't see it animate. First
  thing to eyeball on the Mac: does the arc track the pointer and the reticle sit where the ball lands?
  If it lags or hides, check the `visible` toggles and the `landed` (y ≤ `BOOTH_FOCUS.y`) cutoff.
- **Knocked bottles vanish rather than settle.** They tumble off the shelf and hide below `SETTLE_Y`.
  Reads as "knocked down," but if you want a visible pile, add a ground/counter rest plane in
  `stepBottles` (clamp y, damp velocity, keep the tumble rotation, mark `resting` without hiding).
- **Charge/power feel is sensitive.** The hit window is a diagonal aim×power band; with the slow
  headless charge I mostly tested near-full and near-zero power. On-device, see whether mid-charge is
  controllable; if too twitchy, raise `CHARGE_TIME` or narrow the speed range. An on-screen **power
  meter** (the original spec's optional element) would help legibility — not built.
- **Touch not tested on a real device.** The input uses pointer events (works for mouse + touch in
  principle), but verify charge-and-release on a phone (and that page-scroll/zoom doesn't fight it).
- **`pnpm build` gate deferred** (§0). Run it once on a stopped server to confirm the prod bundle.
- **Juice not added** (cheap wins from the original §3): bottle clack SFX, dust puff, score pop,
  subtle camera shake on a full clear, a little ball spin. Keep it light (Nick is perf/flicker-sensitive;
  no post-processing — it caused the black flicker and was removed).
- **`resetBallToss()` is unused** (the sim uses the mount effect + `replayBallToss`). Harmless; remove
  if you want, or wire it to a "restart from intro."

---

## 8. Scene edits made (so the play zone is clear)

Two props sat in the bottle target spot and occluded it. Removed surgically (one line each) from
`src/components/three/synty/demo-instances.json` — **formatting preserved** (never reparse/reformat
that file wholesale):

- The **elevated counter hay bale** (the "rock" inside the tent Nick flagged) — Unity `(12.23, 0.71, 11.78)`.
- One **pumpkin lantern** sitting exactly where the bottles go — Unity `(13.47, 0.74, 10.99)`.

Both are easy to restore (re-add the transform line) if you'd rather keep them and nudge the stack.
The static `SM_Prop_Milk_Bottle_Toss_Stand_01` decoration (added earlier in `sceneAdditions.ts`) was
left in place — the game spawns its own dynamic bottles in front of it.

---

## 9. Quick orientation for a fresh session

1. `git log --oneline` on `feature/modernise` — the 5 `feat(game)` commits are the whole build.
2. Open `ballTossConfig.ts` (constants), `BallTossGame.tsx` (sim), `BallTossHud.tsx` (UI).
3. `pnpm dev`, click the Ball Toss booth, play a round.
4. Tune §4 constants by feel; use §6's offline tuner to re-centre the hit region after big changes.
5. Tackle a §7 follow-up if you want more polish.
