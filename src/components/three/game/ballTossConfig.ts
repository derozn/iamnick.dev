import { Vector3 } from 'three';

import { ATTRACTIONS } from '../synty/attractions';

/**
 * ball-toss spatial config — the booth's local frame and the bottle-pyramid
 * layout, all in three world space so the physics sim (which runs in world space)
 * and the render share one source of truth.
 *
 * The booth (SM_Prop_Stall_02) sits at three (13, −12), yaw 45°, its opening facing
 * NW toward the iso camera. `facing` is the unit vector from the booth out toward
 * the camera; the ball therefore travels along −facing (into the booth), and the
 * pyramid rows spread along the camera's screen-right axis so all six bottles read.
 */

const booth = ATTRACTIONS.find((a) => a.id === 'ball-toss');
if (!booth) throw new Error('ball-toss attraction missing from ATTRACTIONS');

/** Booth opening centre / camera look target. */
export const BOOTH_FOCUS = new Vector3(booth.position[0], booth.position[1], booth.position[2]);

/** Unit vector from the booth out toward the iso camera (the opening's normal). */
export const FACING = new Vector3(booth.facing[0], booth.facing[1], booth.facing[2]).normalize();

/** Direction the ball travels — into the booth, toward the bottles. */
export const FORWARD = FACING.clone().negate();

/** Camera screen-right on the ground (= FACING rotated −90° about Y); the row axis. */
export const SIDE = new Vector3(FACING.z, 0, -FACING.x).normalize();

/**
 * World point where the front-row bottle bases rest — on the booth counter, just
 * inside the opening. Tuned visually against the booth geometry (see step 2).
 */
export const STACK_ANCHOR = new Vector3(13.45, 0.84, -10.95);

export const SYNTY = '/models/synty/';
/** cm→m — Synty GLBs are authored in centimetres (matches InstancedPrefab). */
export const CM = 0.01;

/** The 3-2-1 pyramid, front row first. Row index rises with height. */
export const PYRAMID_ROWS = [3, 2, 1] as const;

/* --- Throw physics (custom lightweight sim; all tunable for feel) --- */

/** Downward acceleration (m/s²). Softer than real gravity for a floaty arc. */
export const GRAVITY = -8;
/** Launch speed at zero / full charge (m/s). The charge meter lerps between. */
export const MIN_SPEED = 8;
export const MAX_SPEED = 14;
/**
 * Base upward loft added to the (normalised) launch direction before re-normalising.
 * The slingshot pouch sits *above* the stack and only ~4 m away, so the throw is
 * almost flat — gravity drops it into the bottles. Just a hair of lift keeps the
 * preview arc readable; more than this and shots sail over (tuned offline, §6).
 */
export const LAUNCH_LIFT = 0.05;
/** Ball despawns below this world height (fell off / past the booth). */
export const FLOOR_Y = -0.5;
/** Ball is dead once it gets this far from the booth focus (missed long). */
export const MAX_RANGE = 14;
/** Velocity retained after clipping a bottle, so one ball can cascade a stack. */
export const HIT_DAMPING = 0.72;
/**
 * Extra hit slack (m) added to the ball-vs-bottle radius and height test. The
 * bottles are tiny (≈10cm), so a tight test makes near-misses frustrating; this
 * widens the effective target for a forgiving, arcade carnival feel.
 */
export const HIT_FUDGE = 0.08;
/** Points awarded per bottle knocked down. */
export const POINTS_PER_BOTTLE = 100;
/** Bonus for knocking 3+ bottles with a single ball (a stack-clearing strike). */
export const CLEAR_COMBO_BONUS = 250;
/** A single ball must topple at least this many bottles to earn the combo. */
export const COMBO_MIN_HITS = 3;
/** Trajectory-preview sample count (in-scene aim arc). */
export const ARC_SAMPLES = 22;

/* --- Slingshot aim (pull-back-and-release; replaces the old timed charge) --- */

/**
 * The throw is a slingshot: press, drag the ball *back* against where you want it
 * to go, release. Pull distance is power; pull direction is aim; the ball fires
 * opposite the pull. These knobs map a screen drag (in NDC, y-up) to the shot.
 */
/** Pull distance (screen NDC) at which power reaches MAX_SPEED. */
export const PULL_FULL = 0.5;
/** A release with less pull than this (NDC) is a cancel, not a throw — so a tap is safe. */
export const PULL_DEADZONE = 0.05;
/** Max lateral aim swing (radians) at a full sideways pull (fires opposite the pull). */
export const AIM_YAW = 0.5;
/**
 * Extra upward loft at a full *downward* pull, on top of LAUNCH_LIFT. Kept at 0:
 * because the pouch sits above the close target, any loft makes a hard pull sail
 * over the stack — a deep pull should add power, not arc. Raise only if the launch
 * geometry changes (see the offline sweep in §6).
 */
export const AIM_LOFT = 0;
/** Screen anchor (NDC, y-up) for the ready ball / slingshot pouch — lower centre. */
export const POUCH_NDC: readonly [number, number] = [0, -0.5];
/** How far (m) in front of the camera the pouch / launch origin sits. */
export const LAUNCH_DIST = 1.1;
/** World metres the loaded ball is drawn back per unit of NDC pull (visual feedback). */
export const PULL_WORLD = 0.5;

/* --- Topple physics (knocked bottles tumble off the shelf) --- */

/** Horizontal shove (m/s) a directly-hit bottle takes along the ball's path. */
export const KNOCK_PUSH = 1.8;
/** Upward pop (m/s) on a knock, so bottles lift off before falling. */
export const KNOCK_UP = 0.7;
/** Tumble rate (rad/s) imparted on a knock. */
export const KNOCK_SPIN = 12;
/** A toppling bottle nudges standing neighbours within this × bottle-spacing. */
export const CASCADE_RADIUS_FACTOR = 1.7;
/** Cascade nudges are gentler than a direct hit (fraction of KNOCK_PUSH). */
export const CASCADE_PUSH_FACTOR = 0.7;
/** A toppling bottle that falls below this world height is spent (hidden). */
export const SETTLE_Y = -0.4;

/**
 * Resting base positions for the pyramid, given a bottle spacing and per-row rise.
 * Each Vector3 is where that bottle's base should sit (world space, upright),
 * front row first. `spacing` ≈ bottle diameter; `rise` ≈ bottle height × nestle.
 */
export function pyramidPositions(spacing: number, rise: number): Vector3[] {
  const out: Vector3[] = [];
  PYRAMID_ROWS.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      const off = (i - (count - 1) / 2) * spacing;
      out.push(
        STACK_ANCHOR.clone()
          .addScaledVector(SIDE, off)
          .add(new Vector3(0, row * rise, 0)),
      );
    }
  });
  return out;
}
