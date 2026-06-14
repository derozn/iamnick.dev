/**
 * carnival.config — the Dark Carnival as data: a first-person walk that enters
 * down a short neon avenue and opens into a **plaza** ringed with stalls, tents
 * and rides, the ferris wheel closing the back (see docs/redesign/scene-layout.md).
 *
 * Forward = −Z. The camera follows CAMERA_PATH at eye height while its gaze
 * follows LOOK_PATH — so it walks in, arcs into the centre, and surveys the
 * bustle around it. Props are normalised (scaled to `size`, base on the ground)
 * so a placement is just position + yaw; plaza props face the centre.
 */

export type Vec3 = [number, number, number];

/* ── Camera / first-person rail ─────────────────────────────────────────── */

export const EYE_HEIGHT = 1.7;

/** Camera waypoints: outside → through the arch → up the avenue → into the plaza. */
export const CAMERA_PATH: Vec3[] = [
  [0, EYE_HEIGHT, 8],
  [0, EYE_HEIGHT, -1],
  [0.6, EYE_HEIGHT, -10],
  [-0.3, EYE_HEIGHT, -19],
  [0, EYE_HEIGHT, -28],
  [0, EYE_HEIGHT, -38],
];

/** Gaze waypoints: forward up the avenue, then pan left into the plaza and settle on the ferris wheel. */
export const LOOK_PATH: Vec3[] = [
  [0, EYE_HEIGHT - 0.02, -4],
  [0, EYE_HEIGHT - 0.02, -12],
  [0.2, EYE_HEIGHT - 0.02, -20],
  [-2.6, EYE_HEIGHT - 0.05, -32],
  [-0.6, EYE_HEIGHT - 0.08, -46],
  [0, EYE_HEIGHT - 0.05, -58],
];

/** Subtle head-bob, driven by scroll progress (so motion only happens while moving). */
export const BOB_AMP = 0.04;
export const BOB_CYCLES = 30;

export const CAMERA_FOV = 70;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 120;

export const POSITION_SMOOTHING = 0.28;
export const TARGET_SMOOTHING = 0.32;

/* ── Atmosphere ─────────────────────────────────────────────────────────── */

/** Night blue the scene sits in — lighter than a black void so the carnival glows, not gloom. */
export const BACKGROUND_COLOR = '#171326';
export const FOG_NEAR = 10;
export const FOG_FAR = 72;

/** Strategic dust — sparse fog motes, not a snowstorm. */
export const DUST_COUNT_HIGH = 280;
export const DUST_COUNT_LOW = 90;

/* ── Models (converted neutral Synty funfair GLBs) ──────────────────────── */

export const MODELS = {
  entrance: '/models/carnival/entrance.glb',
  ticketBooth: '/models/carnival/ticket-booth.glb',
  signWelcome: '/models/carnival/sign-welcome.glb',
  signGames: '/models/carnival/sign-games.glb',
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
  teacupRide: '/models/carnival/teacup-ride.glb',
  cartCandyfloss: '/models/carnival/cart-candyfloss.glb',
  hotdog: '/models/carnival/hotdog.glb',
  plushies: '/models/carnival/plushies.glb',
  balloon: '/models/carnival/balloon.glb',
  hayBale: '/models/carnival/hay-bale.glb',
  barrel: '/models/carnival/barrel.glb',
  bench: '/models/carnival/bench.glb',
  stool: '/models/carnival/stool.glb',
  lampPost: '/models/carnival/lamp-post.glb',
  lightPole: '/models/carnival/light-pole.glb',
  flags: '/models/carnival/flags.glb',
  fence: '/models/carnival/fence.glb',
  tree1: '/models/carnival/tree-01.glb',
  tree3: '/models/carnival/tree-03.glb',
  bush: '/models/carnival/bush.glb',
  rocks: '/models/carnival/rocks.glb',
} as const;

export type ModelKey = keyof typeof MODELS;

/** Default front of a prop is +Z; rotate to open toward the path / plaza centre. */
export const ROT_LEFT = Math.PI / 2;
export const ROT_RIGHT = -Math.PI / 2;

/** Plaza focus the ringed structures face. */
const C: [number, number] = [0, -42];
/** Yaw that turns a prop's +Z toward the plaza centre. */
const face = (x: number, z: number) => Math.atan2(C[0] - x, C[1] - z);

export interface Placement {
  model: ModelKey;
  position: Vec3;
  rotationY?: number;
  /** Largest normalised dimension (world units). */
  size: number;
  /** Place a warm interior light at this structure (the inviting glow). */
  warm?: boolean;
}

/* ── Structures & scenery ───────────────────────────────────────────────── */

export const PLACEMENTS: Placement[] = [
  // ── Avenue (you walk in) ──
  { model: 'entrance', position: [0, 0, -2], rotationY: 0, size: 5 },
  { model: 'signWelcome', position: [0, 3.0, -2.4], rotationY: 0, size: 3.6 },
  { model: 'ticketBooth', position: [3.3, 0, -1], rotationY: ROT_RIGHT, size: 2.4, warm: true },
  { model: 'stall3', position: [-4.3, 0, -9], rotationY: ROT_LEFT, size: 2.8, warm: true },
  { model: 'tent', position: [4.4, 0, -11], rotationY: ROT_RIGHT, size: 3.2, warm: true },
  { model: 'cartCandyfloss', position: [-3.8, 0, -17], rotationY: ROT_LEFT, size: 1.9, warm: true },
  { model: 'balloon', position: [2.7, 0, -5], rotationY: 0, size: 1.6 },
  { model: 'balloon', position: [-2.9, 0, -21], rotationY: 0, size: 1.5 },

  // ── Plaza ring (faces the centre) ──
  { model: 'stall1', position: [-8.5, 0, -32], rotationY: face(-8.5, -32), size: 2.9, warm: true },
  { model: 'tentLarge', position: [-10, 0, -43], rotationY: face(-10, -43), size: 4.8, warm: true },
  { model: 'canToss', position: [-8.5, 0, -53], rotationY: face(-8.5, -53), size: 2.4, warm: true },
  { model: 'stall2', position: [8.5, 0, -32], rotationY: face(8.5, -32), size: 2.9, warm: true },
  { model: 'tentRing', position: [10, 0, -43], rotationY: face(10, -43), size: 3.6, warm: true },
  { model: 'ringToss', position: [8.5, 0, -53], rotationY: face(8.5, -53), size: 2.4, warm: true },
  { model: 'highStriker', position: [3.5, 0, -60], rotationY: face(3.5, -60), size: 4.6 },
  { model: 'signGames', position: [7.3, 2.3, -30], rotationY: face(7.3, -30), size: 2.2 },

  // ── Rides — the back of the plaza ──
  { model: 'ferrisWheel', position: [0, 0, -60], rotationY: 0, size: 17 },
  {
    model: 'merryGoRound',
    position: [6.5, 0, -58],
    rotationY: face(6.5, -58),
    size: 5.6,
    warm: true,
  },
  {
    model: 'teacupRide',
    position: [-6.5, 0, -58],
    rotationY: face(-6.5, -58),
    size: 4.4,
    warm: true,
  },

  // ── Plaza floor scatter (the bustle) ──
  { model: 'plushies', position: [-7.4, 0, -34], rotationY: face(-7.4, -34), size: 1.4 },
  { model: 'plushies', position: [7.4, 0, -34], rotationY: face(7.4, -34), size: 1.4 },
  { model: 'hotdog', position: [-5.5, 0, -48], rotationY: face(-5.5, -48), size: 1.7, warm: true },
  { model: 'bench', position: [-3.6, 0, -44], rotationY: face(-3.6, -44), size: 1.8 },
  { model: 'bench', position: [3.6, 0, -46], rotationY: face(3.6, -46), size: 1.8 },
  { model: 'stool', position: [2.2, 0, -42], rotationY: 0, size: 0.7 },
  { model: 'stool', position: [-2.1, 0, -45], rotationY: 0, size: 0.7 },
  { model: 'hayBale', position: [-1.6, 0, -38], rotationY: 0.3, size: 0.9 },
  { model: 'hayBale', position: [1.8, 0, -39], rotationY: 0, size: 0.9 },
  { model: 'hayBale', position: [-4, 0, -51], rotationY: 0.6, size: 0.9 },
  { model: 'barrel', position: [1.2, 0, -47], rotationY: 0, size: 0.9 },
  { model: 'barrel', position: [-2.5, 0, -41], rotationY: 0, size: 0.9 },
  { model: 'balloon', position: [-4.5, 0, -36], rotationY: 0, size: 1.5 },
  { model: 'balloon', position: [4.5, 0, -37], rotationY: 0, size: 1.6 },
  { model: 'balloon', position: [0.5, 0, -33], rotationY: 0, size: 1.4 },

  // ── Landscape — frames the carnival in a dark field ──
  { model: 'tree1', position: [-16, 0, -8], rotationY: 0.4, size: 6.5 },
  { model: 'tree3', position: [15, 0, -16], rotationY: 1.2, size: 7.5 },
  { model: 'tree1', position: [-15, 0, -28], rotationY: 2.0, size: 7 },
  { model: 'tree3', position: [16, 0, -40], rotationY: 0.7, size: 8 },
  { model: 'tree1', position: [-16, 0, -52], rotationY: 1.5, size: 7 },
  { model: 'tree3', position: [15, 0, -62], rotationY: 2.4, size: 8 },
  { model: 'bush', position: [11, 0, -12], rotationY: 0, size: 1.4 },
  { model: 'bush', position: [-11, 0, -20], rotationY: 1, size: 1.5 },
  { model: 'bush', position: [12, 0, -48], rotationY: 2, size: 1.4 },
  { model: 'bush', position: [-12, 0, -46], rotationY: 0.5, size: 1.5 },
  { model: 'rocks', position: [10, 0, -34], rotationY: 0.8, size: 1.6 },
  { model: 'rocks', position: [-10, 0, -56], rotationY: 2.2, size: 1.5 },
];

/** Overhead bunting spanning the avenue + plaza. */
export const FLAG_PLACEMENTS: Placement[] = [
  { model: 'flags', position: [0, 3.2, -7], rotationY: 0, size: 4 },
  { model: 'flags', position: [0, 3.2, -18], rotationY: 0, size: 4 },
  { model: 'flags', position: [0, 3.8, -34], rotationY: 0, size: 6 },
  { model: 'flags', position: [0, 3.8, -48], rotationY: 0, size: 6 },
];

export interface Lamp {
  position: Vec3;
  /** A real warm point light here (else emissive bulb only). */
  lit?: boolean;
}

/** Lamp posts: avenue pair-march, then a ring around the plaza. Bulb glow + key lights. */
export const LAMP_PLACEMENTS: Lamp[] = [
  { position: [-5, 0, -6], lit: true },
  { position: [5, 0, -6] },
  { position: [-5, 0, -15] },
  { position: [5, 0, -15], lit: true },
  { position: [-7, 0, -30], lit: true },
  { position: [7, 0, -30], lit: true },
  { position: [-10.5, 0, -44] },
  { position: [10.5, 0, -44] },
  { position: [-5.5, 0, -55], lit: true },
  { position: [5.5, 0, -55], lit: true },
];

export const LAMP_SIZE = 3.6;
/** Bulb glow height (lamp lantern sits near the top of the post). */
export const LAMP_BULB_Y = 3.1;

/** Fence segments lining the avenue edges (high tier only). */
export const FENCE_PLACEMENTS: Placement[] = (() => {
  const out: Placement[] = [];
  for (let z = -3; z >= -24; z -= 2.2) {
    out.push({ model: 'fence', position: [-6.4, 0, z], rotationY: ROT_LEFT, size: 2.3 });
    out.push({ model: 'fence', position: [6.4, 0, z], rotationY: ROT_RIGHT, size: 2.3 });
  }
  return out;
})();
