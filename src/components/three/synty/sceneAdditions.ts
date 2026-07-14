/**
 * sceneAdditions — extra instances we layer on top of the translated demo:
 * bumper cars to fill the empty arena, and more street lamps for atmosphere.
 *
 * Transforms are in the same Unity TRS form as demo-instances.json
 * ([px,py,pz, qx,qy,qz,qw, sx,sy,sz]); three-space position is (px, py, -pz), so
 * the helper takes a three-space (x, z) + yaw and flips z for us.
 */

const at = (x: number, z: number, yawDeg: number, y = 0): number[] => {
  const r = (yawDeg * Math.PI) / 360; // half-angle
  return [x, y, -z, 0, Math.sin(r), 0, Math.cos(r), 1, 1, 1];
};

/** Extra street-lamp positions (three-space x, z, optional yaw°) — also fed to
 *  DynamicLights (which uses x/z and ignores yaw). */
export const EXTRA_LAMPS: [number, number, number?][] = [
  [-1.5, -25],
  [4, -18],
  [-7, -13],
  [3, -6],
  [-9, 3],
  [5, 5],
  [-12, 13],
  // beside the clown-face doorway, on the grass (was [-1, 19], dead in front of it
  // and facing the wrong way); turned 90° so the arm reads along the frontage.
  [-5.5, 21, 90],
];

/** Appended to the matching prefab's instance list in SyntyScene. */
export const EXTRA_INSTANCES: Record<string, number[][]> = {
  // fill the empty bumper-car arena at three-space (28, 5.1)
  SM_Veh_Bumper_Cars_01: [
    at(26.6, 4.2, 20, 0.12),
    at(29.2, 4.0, -40, 0.12),
    at(27.4, 6.4, 120, 0.12),
    at(29.5, 6.4, 205, 0.12),
    at(28.0, 5.2, 70, 0.12),
  ],
  // more lit street lamps along the explorable centre
  SM_Prop_Lamp_Post_02: EXTRA_LAMPS.map(([x, z, yaw]) => at(x, z, yaw ?? 0)),
  // the Ball Toss booth — a stall (facing SW, toward the iso camera) in an open spot
  SM_Prop_Stall_02: [at(13, -12, 45, 0.1)],
  // NB the doodle wall has no stall prefab (Nick, 2026-07-14 — the Stall_03
  // placed here first landed inside an existing tent): the freestanding
  // bulb-strung tile board is drawn entirely by <DoodleWall> at
  // doodleWallConfig.BOARD_CENTER.
  // NB no separate milk-bottle rack: the game's bottle pyramid rests directly on
  // the stall counter (ballTossConfig.STACK_ANCHOR). The rack prop used to float
  // at y=1.0 behind the counter reading as "a random table in the air".
};
