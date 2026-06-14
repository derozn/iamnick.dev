/**
 * carnival.config — the Dark Carnival as data: a first-person walk that enters
 * down a packed neon avenue and opens into a **plaza** crammed with stalls,
 * tents, rides and vehicles, the ferris wheel closing the back. Built dense to
 * mimic the Synty promo — structures front/mid/back so there's no void, stall
 * counters dressed with prizes/food, foliage framing it in a dark field.
 *
 * Forward = −Z. Camera follows CAMERA_PATH at eye height; gaze follows LOOK_PATH.
 * Props are normalised (scaled to `size`, base on the ground) so a placement is
 * just position + yaw; plaza props face the centre via `face()`.
 */

export type Vec3 = [number, number, number];

/* ── Camera / first-person rail ─────────────────────────────────────────── */

export const EYE_HEIGHT = 1.7;

export const CAMERA_PATH: Vec3[] = [
  [0, EYE_HEIGHT, 8],
  [0, EYE_HEIGHT, -1],
  [0.6, EYE_HEIGHT, -10],
  [-0.3, EYE_HEIGHT, -19],
  [0, EYE_HEIGHT, -28],
  [0, EYE_HEIGHT, -37],
];

export const LOOK_PATH: Vec3[] = [
  [0, EYE_HEIGHT - 0.02, -4],
  [0, EYE_HEIGHT - 0.02, -12],
  [0.2, EYE_HEIGHT - 0.02, -20],
  [-2.6, EYE_HEIGHT - 0.05, -32],
  [-0.6, EYE_HEIGHT - 0.08, -46],
  [0, EYE_HEIGHT - 0.05, -58],
];

export const BOB_AMP = 0.04;
export const BOB_CYCLES = 30;

export const CAMERA_FOV = 70;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 130;

export const POSITION_SMOOTHING = 0.28;
export const TARGET_SMOOTHING = 0.32;

/* ── Atmosphere ─────────────────────────────────────────────────────────── */

export const BACKGROUND_COLOR = '#171326';
export const FOG_NEAR = 11;
export const FOG_FAR = 80;

export const DUST_COUNT_HIGH = 280;
export const DUST_COUNT_LOW = 90;

/* ── Models (converted neutral Synty funfair GLBs) ──────────────────────── */

export const MODELS = {
  // structures
  entrance: '/models/carnival/entrance.glb',
  ticketBooth: '/models/carnival/ticket-booth.glb',
  stall1: '/models/carnival/stall-01.glb',
  stall2: '/models/carnival/stall-02.glb',
  stall3: '/models/carnival/stall-03.glb',
  tent: '/models/carnival/tent.glb',
  tentLarge: '/models/carnival/tent-large.glb',
  tentLarge2: '/models/carnival/tent-large-2.glb',
  tentRing: '/models/carnival/tent-ring.glb',
  bleachers: '/models/carnival/bleachers.glb',
  // games & rides
  ferrisWheel: '/models/carnival/ferris-wheel.glb',
  merryGoRound: '/models/carnival/merry-go-round.glb',
  teacupRide: '/models/carnival/teacup-ride.glb',
  swingRide: '/models/carnival/swing-ride.glb',
  bumperCars: '/models/carnival/bumper-cars.glb',
  bouncyCastle: '/models/carnival/bouncy-castle.glb',
  highStriker: '/models/carnival/high-striker.glb',
  canToss: '/models/carnival/can-toss.glb',
  ringToss: '/models/carnival/ring-toss.glb',
  prizeWheel: '/models/carnival/prize-wheel.glb',
  bullsEye: '/models/carnival/bulls-eye.glb',
  dunkTank: '/models/carnival/dunk-tank.glb',
  // vehicles
  truckFood: '/models/carnival/truck-food.glb',
  wagon1: '/models/carnival/wagon-01.glb',
  wagonCage: '/models/carnival/wagon-cage.glb',
  train: '/models/carnival/train.glb',
  trainCarriage: '/models/carnival/train-carriage.glb',
  // food & carts
  cartCandyfloss: '/models/carnival/cart-candyfloss.glb',
  hotdog: '/models/carnival/hotdog.glb',
  burger: '/models/carnival/burger.glb',
  donut: '/models/carnival/donut.glb',
  // prizes (stall interiors)
  plushies: '/models/carnival/plushies.glb',
  plushies2: '/models/carnival/plushies-2.glb',
  plushiesHanging: '/models/carnival/plushies-hanging.glb',
  plushiesPinned: '/models/carnival/plushies-pinned.glb',
  bowlingPin: '/models/carnival/bowling-pin.glb',
  // signage
  signWelcome: '/models/carnival/sign-welcome.glb',
  signGames: '/models/carnival/sign-games.glb',
  signPrizes: '/models/carnival/sign-prizes.glb',
  signRides: '/models/carnival/sign-rides.glb',
  signWin: '/models/carnival/sign-win.glb',
  // gap fillers
  crate1: '/models/carnival/crate-01.glb',
  crate2: '/models/carnival/crate-02.glb',
  barrel: '/models/carnival/barrel.glb',
  generator: '/models/carnival/generator.glb',
  speaker: '/models/carnival/speaker.glb',
  spotlight: '/models/carnival/spotlight.glb',
  bin: '/models/carnival/bin.glb',
  hayBale: '/models/carnival/hay-bale.glb',
  bench: '/models/carnival/bench.glb',
  stool: '/models/carnival/stool.glb',
  balloon: '/models/carnival/balloon.glb',
  // lighting
  lampPost: '/models/carnival/lamp-post.glb',
  // foliage
  tree1: '/models/carnival/tree-01.glb',
  tree2: '/models/carnival/tree-02.glb',
  tree3: '/models/carnival/tree-03.glb',
  tree4: '/models/carnival/tree-04.glb',
  bush: '/models/carnival/bush.glb',
  bush2: '/models/carnival/bush-02.glb',
  flowers: '/models/carnival/flowers.glb',
  sunflower: '/models/carnival/sunflower.glb',
  grassPatch: '/models/carnival/grass-patch.glb',
  rocks: '/models/carnival/rocks.glb',
  rocks2: '/models/carnival/rocks-02.glb',
  // misc
  flags: '/models/carnival/flags.glb',
  fence: '/models/carnival/fence.glb',
} as const;

export type ModelKey = keyof typeof MODELS;

export const ROT_LEFT = Math.PI / 2;
export const ROT_RIGHT = -Math.PI / 2;

/** Plaza focus the ringed structures face. */
const C: [number, number] = [0, -42];
const face = (x: number, z: number) => Math.atan2(C[0] - x, C[1] - z);
/** A point `d` units from (x,z) toward the plaza centre — for dressing stall counters. */
const toward = (x: number, z: number, d: number): [number, number] => {
  const dx = C[0] - x;
  const dz = C[1] - z;
  const L = Math.hypot(dx, dz) || 1;
  return [x + (dx / L) * d, z + (dz / L) * d];
};

export interface Placement {
  model: ModelKey;
  position: Vec3;
  rotationY?: number;
  size: number;
  /** Warm interior light at this structure. */
  warm?: boolean;
}

/* Counter dressing helper: a prize/food prop on a plaza stall's counter, facing out. */
const counter = (model: ModelKey, x: number, z: number, y: number, size: number): Placement => {
  const [tx, tz] = toward(x, z, 0.5);
  return { model, position: [tx, y, tz], rotationY: face(x, z), size };
};

/* ── Core: avenue + plaza ring + rides + vehicles + stall interiors ──────── */

export const PLACEMENTS: Placement[] = [
  // ── Avenue (packed both sides) ──
  { model: 'entrance', position: [0, 0, -2], rotationY: 0, size: 5 },
  { model: 'signWelcome', position: [0, 3.0, -2.4], rotationY: 0, size: 3.6 },
  { model: 'ticketBooth', position: [3.5, 0, -1], rotationY: ROT_RIGHT, size: 2.4, warm: true },
  { model: 'stall3', position: [-4.4, 0, -7], rotationY: ROT_LEFT, size: 2.8, warm: true },
  { model: 'tent', position: [-4.9, 0, -13], rotationY: ROT_LEFT, size: 3.2, warm: true },
  {
    model: 'cartCandyfloss',
    position: [-3.8, 0, -18.5],
    rotationY: ROT_LEFT,
    size: 1.9,
    warm: true,
  },
  { model: 'wagon1', position: [-5.4, 0, -24], rotationY: ROT_LEFT, size: 3.4 },
  { model: 'tentRing', position: [4.8, 0, -8], rotationY: ROT_RIGHT, size: 3.4, warm: true },
  { model: 'truckFood', position: [5.4, 0, -15], rotationY: ROT_RIGHT, size: 3.6, warm: true },
  { model: 'hotdog', position: [3.8, 0, -20], rotationY: ROT_RIGHT, size: 1.7, warm: true },
  { model: 'wagonCage', position: [5.2, 0, -25], rotationY: ROT_RIGHT, size: 3.2 },
  { model: 'signGames', position: [-3.0, 2.4, -10], rotationY: ROT_LEFT, size: 2.0 },
  { model: 'signRides', position: [3.0, 2.4, -11.5], rotationY: ROT_RIGHT, size: 2.0 },

  // ── Plaza ring (faces centre) ──
  { model: 'stall1', position: [-8, 0, -30], rotationY: face(-8, -30), size: 2.9, warm: true },
  {
    model: 'tentLarge',
    position: [-10.5, 0, -38],
    rotationY: face(-10.5, -38),
    size: 4.8,
    warm: true,
  },
  { model: 'canToss', position: [-8.5, 0, -46], rotationY: face(-8.5, -46), size: 2.4, warm: true },
  { model: 'prizeWheel', position: [-8.5, 0, -52], rotationY: face(-8.5, -52), size: 2.6 },
  { model: 'stall2', position: [8, 0, -30], rotationY: face(8, -30), size: 2.9, warm: true },
  {
    model: 'tentLarge2',
    position: [10.5, 0, -38],
    rotationY: face(10.5, -38),
    size: 4.8,
    warm: true,
  },
  { model: 'ringToss', position: [8.5, 0, -46], rotationY: face(8.5, -46), size: 2.4, warm: true },
  { model: 'bullsEye', position: [8.5, 0, -52], rotationY: face(8.5, -52), size: 2.2 },
  { model: 'dunkTank', position: [-3.5, 0, -55], rotationY: face(-3.5, -55), size: 2.8 },
  { model: 'highStriker', position: [3.5, 0, -56], rotationY: face(3.5, -56), size: 4.6 },
  { model: 'signPrizes', position: [-7.4, 2.6, -30], rotationY: face(-7.4, -30), size: 2.0 },
  { model: 'signWin', position: [7.4, 2.6, -30], rotationY: face(7.4, -30), size: 2.0 },

  // ── Back layer: rides + vehicles fill the horizon ──
  { model: 'ferrisWheel', position: [0, 0, -63], rotationY: 0, size: 17 },
  {
    model: 'merryGoRound',
    position: [6.5, 0, -59],
    rotationY: face(6.5, -59),
    size: 5.4,
    warm: true,
  },
  {
    model: 'teacupRide',
    position: [-6.5, 0, -59],
    rotationY: face(-6.5, -59),
    size: 4.2,
    warm: true,
  },
  { model: 'swingRide', position: [13, 0, -56], rotationY: face(13, -56), size: 6.5 },
  { model: 'bumperCars', position: [-13, 0, -54], rotationY: face(-13, -54), size: 5.5 },
  {
    model: 'bouncyCastle',
    position: [-13, 0, -44],
    rotationY: face(-13, -44),
    size: 4.6,
    warm: true,
  },
  { model: 'bleachers', position: [13, 0, -44], rotationY: face(13, -44), size: 4.2 },
  { model: 'train', position: [4, 0, -68], rotationY: 0, size: 4.4 },
  { model: 'trainCarriage', position: [7.6, 0, -68], rotationY: 0, size: 3.6 },

  // ── Stall interiors — prizes & food on the counters ──
  counter('plushiesHanging', -8, -30, 1.4, 1.3),
  counter('plushies', -8, -30, 0.95, 1.0),
  counter('plushies2', 8, -30, 1.4, 1.3),
  counter('bowlingPin', 8, -30, 0.95, 0.5),
  counter('bowlingPin', -8.5, -46, 0.95, 0.5),
  counter('plushiesPinned', 8.5, -46, 1.3, 1.1),
  { model: 'plushiesPinned', position: [-4.0, 1.2, -7.4], rotationY: ROT_LEFT, size: 1.0 },
  { model: 'plushies', position: [-4.1, 0.9, -7.0], rotationY: ROT_LEFT, size: 0.85 },
  { model: 'burger', position: [5.0, 1.05, -15], rotationY: ROT_RIGHT, size: 0.5 },
  { model: 'donut', position: [5.1, 1.05, -15.4], rotationY: ROT_RIGHT, size: 0.4 },
];

/* ── Dense dressing (high tier): scatter fillers + foliage ──────────────── */

export const DENSE_PLACEMENTS: Placement[] = [
  // gap-filler clutter
  { model: 'crate1', position: [-6.5, 0, -10], rotationY: 0.3, size: 0.9 },
  { model: 'crate2', position: [6.3, 0, -12], rotationY: -0.4, size: 0.9 },
  { model: 'crate1', position: [-7, 0, -44], rotationY: 0.8, size: 1.0 },
  { model: 'crate2', position: [7, 0, -44], rotationY: 0.2, size: 1.0 },
  { model: 'crate1', position: [2.4, 0, -50], rotationY: 1.1, size: 0.9 },
  { model: 'barrel', position: [-6.2, 0, -16], rotationY: 0, size: 0.9 },
  { model: 'barrel', position: [6.0, 0, -18], rotationY: 0, size: 0.9 },
  { model: 'barrel', position: [-2.2, 0, -40], rotationY: 0, size: 0.9 },
  { model: 'barrel', position: [2.6, 0, -43], rotationY: 0, size: 0.9 },
  { model: 'barrel', position: [-3.2, 0, -49], rotationY: 0, size: 0.9 },
  { model: 'hayBale', position: [-2, 0, -36], rotationY: 0.3, size: 0.9 },
  { model: 'hayBale', position: [2, 0, -37], rotationY: 0, size: 0.9 },
  { model: 'hayBale', position: [-4.5, 0, -52], rotationY: 0.6, size: 0.9 },
  { model: 'hayBale', position: [4.5, 0, -51], rotationY: 0.2, size: 0.9 },
  { model: 'bin', position: [4.4, 0, -7], rotationY: 0, size: 1.0 },
  { model: 'bin', position: [-5.8, 0, -20], rotationY: 0, size: 1.0 },
  { model: 'generator', position: [-9.6, 0, -33], rotationY: 0.5, size: 1.3 },
  { model: 'generator', position: [9.6, 0, -33], rotationY: -0.5, size: 1.3 },
  { model: 'speaker', position: [-9, 0, -48], rotationY: 0.6, size: 1.1 },
  { model: 'speaker', position: [9, 0, -48], rotationY: -0.6, size: 1.1 },
  { model: 'spotlight', position: [-11.5, 0, -40], rotationY: 0.4, size: 1.4 },
  { model: 'spotlight', position: [11.5, 0, -40], rotationY: -0.4, size: 1.4 },
  { model: 'bench', position: [-3.6, 0, -44], rotationY: face(-3.6, -44), size: 1.8 },
  { model: 'bench', position: [3.6, 0, -46], rotationY: face(3.6, -46), size: 1.8 },
  { model: 'stool', position: [2.2, 0, -42], rotationY: 0, size: 0.7 },
  { model: 'stool', position: [-2.1, 0, -45], rotationY: 0, size: 0.7 },
  { model: 'balloon', position: [2.7, 0, -5], rotationY: 0, size: 1.6 },
  { model: 'balloon', position: [-2.9, 0, -22], rotationY: 0, size: 1.5 },
  { model: 'balloon', position: [-4.5, 0, -36], rotationY: 0, size: 1.5 },
  { model: 'balloon', position: [4.5, 0, -37], rotationY: 0, size: 1.6 },
  { model: 'balloon', position: [0.6, 0, -33], rotationY: 0, size: 1.4 },

  // foliage — layered, framing the field
  { model: 'tree1', position: [-16, 0, -6], rotationY: 0.4, size: 6.5 },
  { model: 'tree3', position: [15, 0, -10], rotationY: 1.2, size: 7 },
  { model: 'tree2', position: [-15, 0, -18], rotationY: 2.0, size: 7.5 },
  { model: 'tree4', position: [16, 0, -22], rotationY: 0.7, size: 8 },
  { model: 'tree1', position: [-18, 0, -30], rotationY: 1.5, size: 7 },
  { model: 'tree3', position: [17, 0, -34], rotationY: 2.4, size: 8 },
  { model: 'tree2', position: [-16, 0, -44], rotationY: 0.9, size: 7.5 },
  { model: 'tree4', position: [16, 0, -50], rotationY: 1.7, size: 8 },
  { model: 'tree1', position: [-15, 0, -60], rotationY: 0.5, size: 7 },
  { model: 'tree3', position: [15, 0, -64], rotationY: 2.1, size: 8 },
  { model: 'tree4', position: [-20, 0, -14], rotationY: 1.0, size: 6.5 },
  { model: 'tree2', position: [20, 0, -42], rotationY: 2.6, size: 6.5 },
  { model: 'bush', position: [11, 0, -14], rotationY: 0, size: 1.4 },
  { model: 'bush2', position: [-11, 0, -22], rotationY: 1, size: 1.5 },
  { model: 'bush', position: [12, 0, -50], rotationY: 2, size: 1.4 },
  { model: 'bush2', position: [-12, 0, -46], rotationY: 0.5, size: 1.5 },
  { model: 'bush', position: [10.5, 0, -32], rotationY: 1.3, size: 1.4 },
  { model: 'bush2', position: [-10.5, 0, -36], rotationY: 0.8, size: 1.4 },
  { model: 'flowers', position: [-9, 0, -28], rotationY: 0, size: 1.0 },
  { model: 'sunflower', position: [9, 0, -28], rotationY: 0, size: 1.3 },
  { model: 'grassPatch', position: [-6, 0, -15], rotationY: 0, size: 1.5 },
  { model: 'flowers', position: [6, 0, -16], rotationY: 0, size: 1.0 },
  { model: 'grassPatch', position: [-3, 0, -30], rotationY: 0, size: 1.5 },
  { model: 'sunflower', position: [3.2, 0, -31], rotationY: 0, size: 1.2 },
  { model: 'grassPatch', position: [13, 0, -30], rotationY: 0, size: 1.6 },
  { model: 'flowers', position: [-13, 0, -52], rotationY: 0, size: 1.1 },
  { model: 'rocks', position: [10, 0, -34], rotationY: 0.8, size: 1.5 },
  { model: 'rocks2', position: [-10, 0, -56], rotationY: 2.2, size: 1.5 },
  { model: 'rocks', position: [13, 0, -24], rotationY: 1.4, size: 1.3 },
  { model: 'rocks2', position: [-13, 0, -26], rotationY: 0.6, size: 1.4 },
];

/** Overhead bunting spanning avenue + plaza. */
export const FLAG_PLACEMENTS: Placement[] = [
  { model: 'flags', position: [0, 3.2, -6], rotationY: 0, size: 4 },
  { model: 'flags', position: [0, 3.2, -14], rotationY: 0, size: 4 },
  { model: 'flags', position: [0, 3.2, -22], rotationY: 0, size: 4 },
  { model: 'flags', position: [0, 3.9, -33], rotationY: 0, size: 6.5 },
  { model: 'flags', position: [0, 3.9, -47], rotationY: 0, size: 6.5 },
];

export interface Lamp {
  position: Vec3;
  lit?: boolean;
}

export const LAMP_PLACEMENTS: Lamp[] = [
  { position: [-5, 0, -6], lit: true },
  { position: [5, 0, -6] },
  { position: [-5, 0, -15] },
  { position: [5, 0, -15], lit: true },
  { position: [-5.5, 0, -24] },
  { position: [5.5, 0, -24] },
  { position: [-7, 0, -30], lit: true },
  { position: [7, 0, -30], lit: true },
  { position: [-11, 0, -42] },
  { position: [11, 0, -42] },
  { position: [-6, 0, -54], lit: true },
  { position: [6, 0, -54], lit: true },
];

export const LAMP_SIZE = 3.6;
export const LAMP_BULB_Y = 3.1;

/** Fence segments lining the avenue edges (high tier only). */
export const FENCE_PLACEMENTS: Placement[] = (() => {
  const out: Placement[] = [];
  for (let z = -3; z >= -26; z -= 2.2) {
    out.push({ model: 'fence', position: [-6.5, 0, z], rotationY: ROT_LEFT, size: 2.3 });
    out.push({ model: 'fence', position: [6.5, 0, z], rotationY: ROT_RIGHT, size: 2.3 });
  }
  return out;
})();
