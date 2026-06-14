/**
 * carnival.config — the Dark Carnival as data: a linear first-person walk down a
 * neon midway street at night (see docs/redesign/scene-layout.md).
 *
 * Forward = −Z. The camera walks the centreline from START_Z to END_Z at eye
 * height; structures line the sides at x ≈ ±4.5 facing inward; the ferris wheel
 * closes the street. Props are normalised (scaled to `size`, base on the ground)
 * so a placement is just position + yaw.
 */

export type Vec3 = [number, number, number];

/* ── Camera / first-person rail ─────────────────────────────────────────── */

export const EYE_HEIGHT = 1.65;
export const START_Z = 5;
export const END_Z = -48;
/** Lateral weave so it reads as walking, not dollying. */
export const PATH_DRIFT_X = 0.7;
export const DRIFT_WEAVES = 3;
/** Subtle head-bob, driven by scroll progress (demand-frameloop friendly). */
export const BOB_AMP = 0.045;
export const BOB_CYCLES = 34;
/** How far ahead down the street the camera looks. */
export const LOOK_AHEAD = 9;

export const CAMERA_FOV = 68;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 95;

export const POSITION_SMOOTHING = 0.25;
export const TARGET_SMOOTHING = 0.3;

/* ── Atmosphere ─────────────────────────────────────────────────────────── */

/** Deep indigo night the street fades into; ferris wheel glows through it. */
export const BACKGROUND_COLOR = '#0e0b1a';
export const FOG_NEAR = 7;
export const FOG_FAR = 56;

/** Fog-mote / dust counts per quality tier. */
export const DUST_COUNT_HIGH = 1200;
export const DUST_COUNT_LOW = 350;

/* ── Models (converted neutral Synty funfair GLBs) ──────────────────────── */

export const MODELS = {
  entrance: '/models/carnival/entrance.glb',
  ticketBooth: '/models/carnival/ticket-booth.glb',
  signWelcome: '/models/carnival/sign-welcome.glb',
  stall1: '/models/carnival/stall-01.glb',
  stall2: '/models/carnival/stall-02.glb',
  stall3: '/models/carnival/stall-03.glb',
  tent: '/models/carnival/tent.glb',
  tentLarge: '/models/carnival/tent-large.glb',
  tentRing: '/models/carnival/tent-ring.glb',
  highStriker: '/models/carnival/high-striker.glb',
  canToss: '/models/carnival/can-toss.glb',
  ringToss: '/models/carnival/ring-toss.glb',
  ferrisWheel: '/models/carnival/ferris-wheel.glb',
  merryGoRound: '/models/carnival/merry-go-round.glb',
  cartCandyfloss: '/models/carnival/cart-candyfloss.glb',
  balloon: '/models/carnival/balloon.glb',
  hayBale: '/models/carnival/hay-bale.glb',
  barrel: '/models/carnival/barrel.glb',
  lampPost: '/models/carnival/lamp-post.glb',
  flags: '/models/carnival/flags.glb',
  fence: '/models/carnival/fence.glb',
} as const;

export type ModelKey = keyof typeof MODELS;

/** Stalls face inward toward the path: left side opens +X, right side opens −X. */
export const ROT_LEFT = Math.PI / 2;
export const ROT_RIGHT = -Math.PI / 2;

export interface Placement {
  model: ModelKey;
  position: Vec3;
  rotationY?: number;
  /** Largest normalised dimension (world units). */
  size: number;
  /** Place a warm interior light at this structure (the inviting glow). */
  warm?: boolean;
}

/* ── Street dressing (front → back) ─────────────────────────────────────── */

export const PLACEMENTS: Placement[] = [
  // Entrance
  { model: 'entrance', position: [0, 0, -2], rotationY: 0, size: 5 },
  { model: 'signWelcome', position: [0, 3.1, -2.5], rotationY: 0, size: 3.6 },
  { model: 'ticketBooth', position: [3.4, 0, -0.5], rotationY: ROT_RIGHT, size: 2.4, warm: true },
  { model: 'balloon', position: [2.7, 0, -4.5], rotationY: 0, size: 1.6 },

  // Games row
  { model: 'stall1', position: [-4.4, 0, -9], rotationY: ROT_LEFT, size: 2.8, warm: true },
  { model: 'highStriker', position: [4.3, 0, -9.5], rotationY: ROT_RIGHT, size: 4.4 },
  { model: 'tent', position: [-4.9, 0, -16.5], rotationY: ROT_LEFT, size: 3.4, warm: true },
  { model: 'stall2', position: [4.4, 0, -16], rotationY: ROT_RIGHT, size: 2.8, warm: true },
  { model: 'balloon', position: [-3.0, 0, -20], rotationY: 0, size: 1.5 },
  { model: 'canToss', position: [-4.0, 0, -23], rotationY: ROT_LEFT, size: 2.4, warm: true },
  { model: 'ringToss', position: [4.0, 0, -23.5], rotationY: ROT_RIGHT, size: 2.4, warm: true },

  // Food & tents
  {
    model: 'cartCandyfloss',
    position: [-3.6, 0, -27.5],
    rotationY: ROT_LEFT,
    size: 1.9,
    warm: true,
  },
  { model: 'tentRing', position: [4.9, 0, -31], rotationY: ROT_RIGHT, size: 3.6, warm: true },
  { model: 'tentLarge', position: [-5.4, 0, -33], rotationY: ROT_LEFT, size: 4.8, warm: true },
  { model: 'hayBale', position: [3.3, 0, -36], rotationY: 0, size: 0.9 },
  { model: 'hayBale', position: [4.0, 0, -36.6], rotationY: 0.5, size: 0.9 },
  { model: 'barrel', position: [2.9, 0, -37], rotationY: 0, size: 0.9 },
  { model: 'stall3', position: [4.4, 0, -39.5], rotationY: ROT_RIGHT, size: 2.8, warm: true },

  // Ride plaza — the destination you walk toward
  { model: 'merryGoRound', position: [5.0, 0, -46], rotationY: 0, size: 5.6, warm: true },
  { model: 'ferrisWheel', position: [-3.5, 0, -62], rotationY: -0.3, size: 14 },
];

/** Overhead bunting lines spanning the street (across X). */
export const FLAG_PLACEMENTS: Placement[] = [
  { model: 'flags', position: [0, 3.3, -13], rotationY: 0, size: 4 },
  { model: 'flags', position: [0, 3.3, -29], rotationY: 0, size: 4 },
];

/** Lamp posts marching down both edges (size includes the post; bulb glow added in-scene). */
export const LAMP_PLACEMENTS: Placement[] = [-6, -14, -22, -30, -38, -46].flatMap((z) => [
  { model: 'lampPost', position: [-5.7, 0, z] as Vec3, rotationY: 0, size: 3.2 },
  { model: 'lampPost', position: [5.7, 0, z] as Vec3, rotationY: 0, size: 3.2 },
]);

/** Fence segments lining the street edges (high tier only — pure dressing). */
export const FENCE_PLACEMENTS: Placement[] = (() => {
  const out: Placement[] = [];
  for (let z = -3; z >= -47; z -= 2.2) {
    out.push({ model: 'fence', position: [-6.6, 0, z], rotationY: ROT_LEFT, size: 2.3 });
    out.push({ model: 'fence', position: [6.6, 0, z], rotationY: ROT_RIGHT, size: 2.3 });
  }
  return out;
})();

/** Approx top-of-lamp height for the emissive bulb glow (post is `size` tall). */
export const LAMP_BULB_Y = 3.0;
