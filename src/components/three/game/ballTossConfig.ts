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
