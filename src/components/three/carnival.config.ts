/**
 * carnival.config — the Dark Carnival as data, built with STRUCTURE: a textured
 * dirt road runs down the spine; stalls and tents line it in neat rows facing
 * the road; the fairway passes through sections (entrance → games → food) and
 * opens into a plaza ringed with rides. Foliage frames the whole field.
 *
 * Forward = −Z, road centred on x = 0. Front rows sit at x = ±5 facing the road
 * (ROT_LEFT / ROT_RIGHT); back rows at x = ±9 add depth. Plaza structures face
 * the plaza centre via `face()`. Props are normalised (scaled to `size`, base on
 * the ground) so a placement is just position + yaw.
 */

export type Vec3 = [number, number, number];

/* ── Camera / first-person rail ─────────────────────────────────────────── */

export const EYE_HEIGHT = 1.7;

/** Straight walk down the road into the plaza — the road leads the eye. */
export const CAMERA_PATH: Vec3[] = [
  [0, EYE_HEIGHT, 9],
  [0, EYE_HEIGHT, -2],
  [0, EYE_HEIGHT, -12],
  [0, EYE_HEIGHT, -22],
  [0, EYE_HEIGHT, -32],
  [0, EYE_HEIGHT, -42],
];

export const LOOK_PATH: Vec3[] = [
  [0, EYE_HEIGHT - 0.02, -4],
  [0, EYE_HEIGHT - 0.02, -14],
  [0, EYE_HEIGHT - 0.02, -24],
  [0, EYE_HEIGHT - 0.03, -34],
  [0, EYE_HEIGHT - 0.05, -46],
  [0, EYE_HEIGHT - 0.05, -58],
];

export const BOB_AMP = 0.035;
export const BOB_CYCLES = 30;

export const CAMERA_FOV = 70;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 130;

export const POSITION_SMOOTHING = 0.28;
export const TARGET_SMOOTHING = 0.32;

/* ── Atmosphere ─────────────────────────────────────────────────────────── */

export const BACKGROUND_COLOR = '#171326';
export const FOG_NEAR = 11;
export const FOG_FAR = 82;

export const DUST_COUNT_HIGH = 260;
export const DUST_COUNT_LOW = 90;

/* ── Models ─────────────────────────────────────────────────────────────── */

export const MODELS = {
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
  truckFood: '/models/carnival/truck-food.glb',
  wagon1: '/models/carnival/wagon-01.glb',
  wagonCage: '/models/carnival/wagon-cage.glb',
  train: '/models/carnival/train.glb',
  trainCarriage: '/models/carnival/train-carriage.glb',
  cartCandyfloss: '/models/carnival/cart-candyfloss.glb',
  hotdog: '/models/carnival/hotdog.glb',
  burger: '/models/carnival/burger.glb',
  donut: '/models/carnival/donut.glb',
  plushies: '/models/carnival/plushies.glb',
  plushies2: '/models/carnival/plushies-2.glb',
  plushiesHanging: '/models/carnival/plushies-hanging.glb',
  plushiesPinned: '/models/carnival/plushies-pinned.glb',
  bowlingPin: '/models/carnival/bowling-pin.glb',
  signWelcome: '/models/carnival/sign-welcome.glb',
  signGames: '/models/carnival/sign-games.glb',
  signPrizes: '/models/carnival/sign-prizes.glb',
  signRides: '/models/carnival/sign-rides.glb',
  signWin: '/models/carnival/sign-win.glb',
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
  lampPost: '/models/carnival/lamp-post.glb',
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
  flags: '/models/carnival/flags.glb',
  fence: '/models/carnival/fence.glb',
} as const;

export type ModelKey = keyof typeof MODELS;

export const ROT_LEFT = Math.PI / 2; // left row opens toward +X (the road)
export const ROT_RIGHT = -Math.PI / 2; // right row opens toward −X (the road)

/** Plaza focus the ringed structures face. */
const C: [number, number] = [0, -52];
const face = (x: number, z: number) => Math.atan2(C[0] - x, C[1] - z);

export interface Placement {
  model: ModelKey;
  position: Vec3;
  rotationY?: number;
  size: number;
  warm?: boolean;
}

/* ── Core: rows along the road + plaza ring + interiors ─────────────────── */

export const PLACEMENTS: Placement[] = [
  // ── Entrance ──
  { model: 'entrance', position: [0, 0, -2], rotationY: 0, size: 5 },
  { model: 'signWelcome', position: [0, 3.0, -2.4], rotationY: 0, size: 3.6 },
  { model: 'ticketBooth', position: [3.5, 0, -0.5], rotationY: ROT_RIGHT, size: 2.4, warm: true },

  // ── Games section — front rows (x ±5) face the road ──
  { model: 'stall3', position: [-5, 0, -8], rotationY: ROT_LEFT, size: 2.8, warm: true },
  { model: 'tent', position: [-5, 0, -14], rotationY: ROT_LEFT, size: 3.2, warm: true },
  { model: 'stall1', position: [-5, 0, -20], rotationY: ROT_LEFT, size: 2.8, warm: true },
  { model: 'canToss', position: [-5, 0, -26], rotationY: ROT_LEFT, size: 2.4, warm: true },
  { model: 'tentRing', position: [5, 0, -8], rotationY: ROT_RIGHT, size: 3.2, warm: true },
  { model: 'stall2', position: [5, 0, -14], rotationY: ROT_RIGHT, size: 2.8, warm: true },
  { model: 'ringToss', position: [5, 0, -20], rotationY: ROT_RIGHT, size: 2.4, warm: true },
  { model: 'bullsEye', position: [5, 0, -26], rotationY: ROT_RIGHT, size: 2.2 },
  // back rows (x ±9) — taller things for depth
  { model: 'wagon1', position: [-9.2, 0, -11], rotationY: ROT_LEFT, size: 3.4 },
  { model: 'highStriker', position: [-9.2, 0, -23], rotationY: ROT_LEFT, size: 4.6 },
  { model: 'truckFood', position: [9.2, 0, -11], rotationY: ROT_RIGHT, size: 3.6, warm: true },
  { model: 'prizeWheel', position: [9.2, 0, -23], rotationY: ROT_RIGHT, size: 2.6 },
  // section signage over the front stalls
  { model: 'signGames', position: [-3.3, 2.5, -8], rotationY: ROT_LEFT, size: 2.0 },
  { model: 'signRides', position: [3.3, 2.5, -8], rotationY: ROT_RIGHT, size: 2.0 },
  { model: 'signPrizes', position: [-3.3, 2.5, -20], rotationY: ROT_LEFT, size: 2.0 },
  { model: 'signWin', position: [3.3, 2.5, -20], rotationY: ROT_RIGHT, size: 2.0 },

  // ── Food section ──
  { model: 'cartCandyfloss', position: [-5, 0, -32], rotationY: ROT_LEFT, size: 1.9, warm: true },
  { model: 'hotdog', position: [-5, 0, -37], rotationY: ROT_LEFT, size: 1.7, warm: true },
  { model: 'wagonCage', position: [5, 0, -32], rotationY: ROT_RIGHT, size: 3.2 },
  { model: 'dunkTank', position: [5, 0, -37], rotationY: ROT_RIGHT, size: 2.8 },
  { model: 'bench', position: [-2.8, 0, -34], rotationY: ROT_LEFT, size: 1.7 },
  { model: 'bench', position: [2.8, 0, -35], rotationY: ROT_RIGHT, size: 1.7 },
  { model: 'stool', position: [-2.2, 0, -36], rotationY: 0, size: 0.7 },
  { model: 'stool', position: [2.2, 0, -33], rotationY: 0, size: 0.7 },

  // ── Plaza — rides ring the centre ──
  { model: 'ferrisWheel', position: [0, 0, -60], rotationY: 0, size: 17 },
  { model: 'merryGoRound', position: [7, 0, -52], rotationY: face(7, -52), size: 5.4, warm: true },
  { model: 'teacupRide', position: [-7, 0, -52], rotationY: face(-7, -52), size: 4.2, warm: true },
  { model: 'swingRide', position: [12, 0, -56], rotationY: face(12, -56), size: 6.5 },
  { model: 'bumperCars', position: [-12, 0, -56], rotationY: face(-12, -56), size: 5.5 },
  {
    model: 'bouncyCastle',
    position: [-11, 0, -45],
    rotationY: face(-11, -45),
    size: 4.6,
    warm: true,
  },
  { model: 'bleachers', position: [11, 0, -45], rotationY: face(11, -45), size: 4.2 },
  { model: 'train', position: [4, 0, -65], rotationY: 0, size: 4.4 },
  { model: 'trainCarriage', position: [7.6, 0, -65], rotationY: 0, size: 3.6 },

  // ── Stall interiors — prizes & food on the counters (toward the road) ──
  { model: 'plushiesPinned', position: [-4.2, 1.2, -8], rotationY: ROT_LEFT, size: 1.0 },
  { model: 'plushies', position: [-4.3, 0.9, -7.6], rotationY: ROT_LEFT, size: 0.8 },
  { model: 'plushiesHanging', position: [-4.2, 1.4, -20], rotationY: ROT_LEFT, size: 1.2 },
  { model: 'bowlingPin', position: [-4.3, 0.9, -26], rotationY: ROT_LEFT, size: 0.5 },
  { model: 'plushies2', position: [4.2, 1.3, -14], rotationY: ROT_RIGHT, size: 1.2 },
  { model: 'plushiesPinned', position: [4.2, 1.2, -20], rotationY: ROT_RIGHT, size: 1.0 },
  { model: 'burger', position: [8.5, 1.05, -11], rotationY: ROT_RIGHT, size: 0.5 },
  { model: 'donut', position: [8.6, 1.05, -11.4], rotationY: ROT_RIGHT, size: 0.4 },
];

/* ── Dense dressing (high tier): row-gap fillers + foliage frame ─────────── */

const FILLERS: Placement[] = [
  // tucked into the gaps between stalls in each row
  { model: 'crate1', position: [-5.3, 0, -11], rotationY: 0.3, size: 0.9 },
  { model: 'barrel', position: [-5.3, 0, -17], rotationY: 0, size: 0.9 },
  { model: 'bin', position: [-5.3, 0, -23], rotationY: 0, size: 1.0 },
  { model: 'crate2', position: [5.3, 0, -11], rotationY: -0.3, size: 0.9 },
  { model: 'barrel', position: [5.3, 0, -17], rotationY: 0, size: 0.9 },
  { model: 'bin', position: [5.3, 0, -23], rotationY: 0, size: 1.0 },
  { model: 'generator', position: [-9.6, 0, -33], rotationY: 0.5, size: 1.3 },
  { model: 'generator', position: [9.6, 0, -33], rotationY: -0.5, size: 1.3 },
  { model: 'hayBale', position: [-3.2, 0, -39], rotationY: 0.3, size: 0.9 },
  { model: 'hayBale', position: [3.2, 0, -40], rotationY: 0, size: 0.9 },
  { model: 'crate1', position: [-3, 0, -44], rotationY: 0.6, size: 0.9 },
  { model: 'barrel', position: [3, 0, -45], rotationY: 0, size: 0.9 },
  { model: 'speaker', position: [-9, 0, -48], rotationY: 0.6, size: 1.1 },
  { model: 'speaker', position: [9, 0, -48], rotationY: -0.6, size: 1.1 },
  { model: 'spotlight', position: [-12.5, 0, -42], rotationY: 0.4, size: 1.4 },
  { model: 'spotlight', position: [12.5, 0, -42], rotationY: -0.4, size: 1.4 },
  { model: 'balloon', position: [2.7, 0, -4], rotationY: 0, size: 1.6 },
  { model: 'balloon', position: [-2.9, 0, -28], rotationY: 0, size: 1.5 },
  { model: 'balloon', position: [-4.5, 0, -45], rotationY: 0, size: 1.5 },
  { model: 'balloon', position: [4.5, 0, -46], rotationY: 0, size: 1.6 },
];

/* Foliage frame — dense tree line lining the whole fairway, both sides. */
const FOLIAGE: Placement[] = (() => {
  const out: Placement[] = [];
  const trees: ModelKey[] = ['tree1', 'tree2', 'tree3', 'tree4'];
  let i = 0;
  for (let z = 0; z >= -68; z -= 6.5) {
    out.push({
      model: trees[i % 4],
      position: [-15 - (i % 2), 0, z],
      rotationY: i * 0.6,
      size: 6.5 + (i % 3),
    });
    out.push({
      model: trees[(i + 2) % 4],
      position: [15 + (i % 2), 0, z - 3],
      rotationY: i * 0.9,
      size: 6.5 + ((i + 1) % 3),
    });
    i++;
  }
  // inner verge: bushes / flowers / rocks softening the row-to-treeline gap
  const verge: Placement[] = [
    { model: 'bush', position: [-11, 0, -14], rotationY: 0, size: 1.4 },
    { model: 'bush2', position: [11, 0, -18], rotationY: 1, size: 1.5 },
    { model: 'bush', position: [-11, 0, -34], rotationY: 2, size: 1.4 },
    { model: 'bush2', position: [11, 0, -38], rotationY: 0.5, size: 1.5 },
    { model: 'rocks', position: [-12, 0, -26], rotationY: 0.8, size: 1.4 },
    { model: 'rocks2', position: [12, 0, -28], rotationY: 2.2, size: 1.4 },
    { model: 'flowers', position: [-7.5, 0, -30], rotationY: 0, size: 1.0 },
    { model: 'sunflower', position: [7.5, 0, -30], rotationY: 0, size: 1.2 },
    { model: 'grassPatch', position: [-8, 0, -42], rotationY: 0, size: 1.6 },
    { model: 'grassPatch', position: [8, 0, -43], rotationY: 0, size: 1.6 },
    { model: 'rocks', position: [10, 0, -58], rotationY: 1, size: 1.5 },
    { model: 'rocks2', position: [-10, 0, -60], rotationY: 2, size: 1.5 },
  ];
  return [...out, ...verge];
})();

export const DENSE_PLACEMENTS: Placement[] = [...FILLERS, ...FOLIAGE];

/** Overhead bunting spanning the road at regular intervals. */
export const FLAG_PLACEMENTS: Placement[] = [
  { model: 'flags', position: [0, 3.2, -6], rotationY: 0, size: 4.5 },
  { model: 'flags', position: [0, 3.2, -14], rotationY: 0, size: 4.5 },
  { model: 'flags', position: [0, 3.2, -22], rotationY: 0, size: 4.5 },
  { model: 'flags', position: [0, 3.2, -30], rotationY: 0, size: 4.5 },
  { model: 'flags', position: [0, 4.0, -44], rotationY: 0, size: 7 },
];

export interface Lamp {
  position: Vec3;
  lit?: boolean;
}

/** Lamp posts marching down both road edges at a regular cadence. */
export const LAMP_PLACEMENTS: Lamp[] = [-6, -14, -22, -30, -38].flatMap((z, i) => [
  { position: [-5.7, 0, z] as Vec3, lit: i % 2 === 0 },
  { position: [5.7, 0, z] as Vec3, lit: i % 2 === 1 },
]);

export const LAMP_SIZE = 3.6;
export const LAMP_BULB_Y = 3.1;

/** Fence segments lining the road edges through the avenue (high tier only). */
export const FENCE_PLACEMENTS: Placement[] = (() => {
  const out: Placement[] = [];
  for (let z = -3; z >= -30; z -= 2.2) {
    out.push({ model: 'fence', position: [-6.6, 0, z], rotationY: ROT_LEFT, size: 2.3 });
    out.push({ model: 'fence', position: [6.6, 0, z], rotationY: ROT_RIGHT, size: 2.3 });
  }
  return out;
})();
