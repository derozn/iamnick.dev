/**
 * carnival.config — the Dark Carnival as data: a first-person **dog-leg** walk.
 * You enter under the arch, walk a games corridor heading −Z, the road bends
 * left at a big-top, and a food corridor heading −X opens into a plaza of rides
 * (the ferris wheel is hidden until you round the bend — the reveal). Decor is an
 * **autumn fair**: plain pumpkins, hay, leaves, lanterns, warm lights.
 *
 * Forward = −Z then −X. Camera follows CAMERA_PATH; gaze follows LOOK_PATH (it
 * swings west at the bend to reveal the plaza). Props are normalised (scaled to
 * `size`, base on the ground) so a placement is just position + yaw.
 *
 * Spatial grammar (so it reads as a place, not scattered clutter):
 *  - structures sit in tidy ROWS facing the road; the road is textured gravel.
 *  - life-like SCATTER ZONES (tree + rock pile + pumpkins + bench + leaves) ring
 *    the attractions and edge the field — see `scatterCluster()`.
 */

export type Vec3 = [number, number, number];

/* ── Camera / first-person rail (the dog-leg) ───────────────────────────── */

export const EYE_HEIGHT = 1.7;

export const CAMERA_PATH: Vec3[] = [
  [0, EYE_HEIGHT, 6],
  [0, EYE_HEIGHT, -8],
  [0, EYE_HEIGHT, -18],
  [-4, EYE_HEIGHT, -23],
  [-13, EYE_HEIGHT, -24],
  [-23, EYE_HEIGHT, -24],
  [-31, EYE_HEIGHT, -24],
];

export const LOOK_PATH: Vec3[] = [
  [0, EYE_HEIGHT - 0.02, -6],
  [0, EYE_HEIGHT - 0.02, -16],
  [-2, EYE_HEIGHT - 0.04, -22],
  [-14, EYE_HEIGHT - 0.06, -24],
  [-26, EYE_HEIGHT - 0.06, -24],
  [-40, EYE_HEIGHT - 0.04, -24],
  [-46, EYE_HEIGHT - 0.04, -24],
];

export const BOB_AMP = 0.035;
export const BOB_CYCLES = 30;

export const CAMERA_FOV = 70;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 140;

export const POSITION_SMOOTHING = 0.3;
export const TARGET_SMOOTHING = 0.34;

/* ── Atmosphere ─────────────────────────────────────────────────────────── */

export const BACKGROUND_COLOR = '#161325';
export const FOG_NEAR = 12;
export const FOG_FAR = 78;

export const DUST_COUNT_HIGH = 240;
export const DUST_COUNT_LOW = 80;

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
  bin: '/models/carnival/bin.glb',
  hayBale: '/models/carnival/hay-bale.glb',
  haySeat: '/models/carnival/hay-seat.glb',
  bench: '/models/carnival/bench.glb',
  stool: '/models/carnival/stool.glb',
  balloon: '/models/carnival/balloon.glb',
  pumpkin1: '/models/carnival/pumpkin-1.glb',
  pumpkin2: '/models/carnival/pumpkin-2.glb',
  pumpkin3: '/models/carnival/pumpkin-3.glb',
  leaves: '/models/carnival/leaves.glb',
  leafPile: '/models/carnival/leaf-pile.glb',
  lantern: '/models/carnival/lantern.glb',
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
  fenceGate: '/models/carnival/fence-gate.glb',
  // attractions + decoration
  bumperArena: '/models/carnival/bumper-arena.glb',
  targetDucks: '/models/carnival/target-ducks.glb',
  pieWall: '/models/carnival/pie-wall.glb',
  waterTower: '/models/carnival/water-tower.glb',
  barricade1: '/models/carnival/barricade-1.glb',
  barricade2: '/models/carnival/barricade-2.glb',
  barricade3: '/models/carnival/barricade-3.glb',
  barricadeConn: '/models/carnival/barricade-conn.glb',
  buntingPole: '/models/carnival/bunting-pole.glb',
  loudspeaker: '/models/carnival/loudspeaker.glb',
  papers: '/models/carnival/papers.glb',
  plushiesHanging2: '/models/carnival/plushies-hanging2.glb',
  rubberDucky: '/models/carnival/rubber-ducky.glb',
  signTickets: '/models/carnival/sign-tickets.glb',
  signFood: '/models/carnival/sign-food.glb',
  signBillboard: '/models/carnival/sign-billboard.glb',
  // spooky (reviewable)
  skeleton: '/models/carnival/skeleton.glb',
  skull: '/models/carnival/skull.glb',
  spider1: '/models/carnival/spider-1.glb',
  spider2: '/models/carnival/spider-2.glb',
  jack1: '/models/carnival/jack-1.glb',
  jack2: '/models/carnival/jack-2.glb',
  jack3: '/models/carnival/jack-3.glb',
  crystalBall: '/models/carnival/crystal-ball.glb',
  jackInBox: '/models/carnival/jack-in-box.glb',
  clownBox: '/models/carnival/clown-box.glb',
  laughingClown: '/models/carnival/laughing-clown.glb',
  monkey: '/models/carnival/monkey.glb',
} as const;

export type ModelKey = keyof typeof MODELS;

export const ROT_LEFT = Math.PI / 2;
export const ROT_RIGHT = -Math.PI / 2;

/** Plaza centre the rides face. */
export const PLAZA_C: [number, number] = [-37, -24];
const face = (x: number, z: number) => Math.atan2(PLAZA_C[0] - x, PLAZA_C[1] - z);

export interface Placement {
  model: ModelKey;
  position: Vec3;
  rotationY?: number;
  size: number;
  warm?: boolean;
}

/* ── Core: rows + bend + plaza ring + stall interiors ───────────────────── */

export const PLACEMENTS: Placement[] = [
  // Entrance
  { model: 'entrance', position: [0, 0, -2], rotationY: 0, size: 5 },
  { model: 'signWelcome', position: [0, 3.0, -2.4], rotationY: 0, size: 3.6 },
  { model: 'ticketBooth', position: [3.5, 0, -1], rotationY: ROT_RIGHT, size: 2.4, warm: true },

  // Games corridor — front rows face the road
  { model: 'stall3', position: [-5, 0, -7], rotationY: ROT_LEFT, size: 2.8, warm: true },
  { model: 'tent', position: [-5, 0, -12], rotationY: ROT_LEFT, size: 3.2, warm: true },
  { model: 'canToss', position: [-5, 0, -17], rotationY: ROT_LEFT, size: 2.4, warm: true },
  { model: 'tentRing', position: [5, 0, -7], rotationY: ROT_RIGHT, size: 3.2, warm: true },
  { model: 'stall2', position: [5, 0, -12], rotationY: ROT_RIGHT, size: 2.8, warm: true },
  { model: 'ringToss', position: [5, 0, -17], rotationY: ROT_RIGHT, size: 2.4, warm: true },
  // back rows (depth)
  { model: 'wagon1', position: [-9, 0, -9], rotationY: ROT_LEFT, size: 3.4 },
  { model: 'highStriker', position: [-9, 0, -15], rotationY: ROT_LEFT, size: 4.6 },
  { model: 'truckFood', position: [9, 0, -9], rotationY: ROT_RIGHT, size: 3.6, warm: true },
  { model: 'prizeWheel', position: [9, 0, -15], rotationY: ROT_RIGHT, size: 2.6 },
  // signage over the stalls
  { model: 'signGames', position: [-3.3, 2.5, -7], rotationY: ROT_LEFT, size: 2.0 },
  { model: 'signRides', position: [3.3, 2.5, -7], rotationY: ROT_RIGHT, size: 2.0 },
  { model: 'signPrizes', position: [-3.3, 2.5, -15], rotationY: ROT_LEFT, size: 2.0 },
  { model: 'signWin', position: [3.3, 2.5, -15], rotationY: ROT_RIGHT, size: 2.0 },

  // The bend — big-top blocks the plaza
  { model: 'tentLarge', position: [-6, 0, -20], rotationY: 2.3, size: 4.8, warm: true },

  // Food corridor (road z≈-24)
  { model: 'cartCandyfloss', position: [-12, 0, -20], rotationY: Math.PI, size: 1.9, warm: true },
  { model: 'hotdog', position: [-20, 0, -20], rotationY: Math.PI, size: 1.7, warm: true },
  { model: 'wagonCage', position: [-12, 0, -28], rotationY: 0, size: 3.2 },
  { model: 'dunkTank', position: [-20, 0, -28], rotationY: 0, size: 2.8 },
  { model: 'bleachers', position: [-27, 0, -28], rotationY: 0, size: 4.2 },

  // Plaza — rides ring the centre
  { model: 'ferrisWheel', position: [-46, 0, -24], rotationY: face(-46, -24), size: 17 },
  {
    model: 'merryGoRound',
    position: [-37, 0, -31],
    rotationY: face(-37, -31),
    size: 5,
    warm: true,
  },
  {
    model: 'teacupRide',
    position: [-37, 0, -17],
    rotationY: face(-37, -17),
    size: 4.2,
    warm: true,
  },
  { model: 'swingRide', position: [-44, 0, -31], rotationY: face(-44, -31), size: 6.5 },
  // bumper-car ARENA (the proper attraction) + cars inside it
  { model: 'bumperArena', position: [-44, 0, -17], rotationY: face(-44, -17), size: 7, warm: true },
  { model: 'bumperCars', position: [-44, 0.05, -17], rotationY: face(-44, -17), size: 4 },
  {
    model: 'bouncyCastle',
    position: [-30, 0, -18],
    rotationY: face(-30, -18),
    size: 4.4,
    warm: true,
  },

  // Extra game attractions (duck gallery + pie wall) on the food row
  { model: 'targetDucks', position: [-27, 0, -20], rotationY: Math.PI, size: 2.6, warm: true },
  { model: 'pieWall', position: [-8, 0, -28], rotationY: 0, size: 2.6 },

  // Water-tower landmark on the skyline behind the plaza
  { model: 'waterTower', position: [-52, 0, -34], rotationY: 0.6, size: 9 },

  // Stall interiors — prizes/food on the counters (toward the road)
  { model: 'plushiesPinned', position: [-4.2, 1.2, -7], rotationY: ROT_LEFT, size: 1.0 },
  { model: 'plushies', position: [-4.3, 0.9, -7.5], rotationY: ROT_LEFT, size: 0.8 },
  { model: 'plushiesHanging', position: [-4.2, 1.4, -17], rotationY: ROT_LEFT, size: 1.2 },
  { model: 'plushies2', position: [4.2, 1.3, -12], rotationY: ROT_RIGHT, size: 1.2 },
  { model: 'bowlingPin', position: [4.3, 0.9, -17], rotationY: ROT_RIGHT, size: 0.5 },
  { model: 'burger', position: [8.5, 1.05, -9], rotationY: ROT_RIGHT, size: 0.5 },
  { model: 'donut', position: [8.6, 1.05, -9.4], rotationY: ROT_RIGHT, size: 0.4 },
];

/* ── Life-like scatter zones (high tier) ────────────────────────────────── */

const TREES: ModelKey[] = ['tree1', 'tree2', 'tree3', 'tree4'];
const PUMPKINS: ModelKey[] = ['pumpkin1', 'pumpkin2', 'pumpkin3'];
const ROCKS: ModelKey[] = ['rocks', 'rocks2'];

/**
 * A natural little zone you'd find around a fairground: a tree with a rock pile,
 * pumpkins nestled at its foot, a bench or hay to sit, and fallen leaves. `i`
 * varies species/arrangement deterministically.
 */
function scatterCluster(cx: number, cz: number, i: number): Placement[] {
  const s = i % 2 ? 1 : -1;
  return [
    { model: TREES[i % 4], position: [cx, 0, cz], rotationY: i * 0.7, size: 6 + (i % 3) },
    { model: ROCKS[i % 2], position: [cx + 1.6 * s, 0, cz + 0.5], rotationY: i, size: 1.5 },
    {
      model: ROCKS[(i + 1) % 2],
      position: [cx - 1.1 * s, 0, cz + 1.1],
      rotationY: i * 1.3,
      size: 1.0,
    },
    { model: PUMPKINS[i % 3], position: [cx + 0.8 * s, 0, cz - 1.0], rotationY: i, size: 0.7 },
    {
      model: PUMPKINS[(i + 1) % 3],
      position: [cx + 1.3 * s, 0, cz - 0.6],
      rotationY: i * 2,
      size: 0.6,
    },
    {
      model: i % 2 ? 'bench' : 'hayBale',
      position: [cx - 1.8 * s, 0, cz - 0.4],
      rotationY: i + 1,
      size: i % 2 ? 1.7 : 0.9,
    },
    { model: 'leafPile', position: [cx + 0.2 * s, 0, cz + 0.4], rotationY: i, size: 1.5 },
    ...(i % 3 === 0
      ? [
          {
            model: 'bush' as ModelKey,
            position: [cx + 2.2 * s, 0, cz - 1.4] as Vec3,
            rotationY: i,
            size: 1.3,
          },
        ]
      : []),
  ];
}

const CLUSTER_SPOTS: [number, number][] = [
  // games field edges
  [-13, -3],
  [13, -6],
  [-13, -13],
  [13, -14],
  [-14, -19],
  // food field edges
  [-16, -17],
  [-25, -18],
  [-15, -32],
  [-24, -33],
  [-31, -30],
  // plaza perimeter
  [-49, -19],
  [-46, -33],
  [-29, -12],
  [-37, -35],
];

/** Per games-stall autumn dressing: pumpkin + hay at the base, crate at the corner, leaves on the verge. */
const STALL_DRESSING: Placement[] = [
  [-5, -7],
  [-5, -12],
  [-5, -17],
  [5, -7],
  [5, -12],
  [5, -17],
].flatMap(([x, z], i): Placement[] => {
  const s = Math.sign(x);
  return [
    { model: PUMPKINS[i % 3], position: [x - s * 0.7, 0, z + 0.7], rotationY: i, size: 0.7 },
    { model: 'hayBale', position: [x - s * 0.4, 0, z - 0.8], rotationY: i, size: 0.85 },
    {
      model: i % 2 ? 'crate1' : 'crate2',
      position: [x + s * 0.5, 0, z + 1.2],
      rotationY: i,
      size: 0.9,
    },
    { model: 'leafPile', position: [x - s * 1.7, 0, z], rotationY: i, size: 1.2 },
  ];
});

const FILLERS: Placement[] = [
  { model: 'barrel', position: [-6.4, 0, -10], rotationY: 0, size: 0.9 },
  { model: 'bin', position: [6.4, 0, -10], rotationY: 0, size: 1.0 },
  { model: 'generator', position: [10.4, 0, -12], rotationY: 0.4, size: 1.3 },
  { model: 'barrel', position: [-13.5, 0, -24], rotationY: 0, size: 0.9 },
  { model: 'crate1', position: [-22.5, 0, -24], rotationY: 0.5, size: 0.9 },
  // food picnic seating cluster
  { model: 'haySeat', position: [-16, 0, -24], rotationY: 0.4, size: 1.2 },
  { model: 'stool', position: [-15, 0, -23], rotationY: 0, size: 0.7 },
  { model: 'bench', position: [-18, 0, -23.4], rotationY: Math.PI, size: 1.7 },
  { model: 'pumpkin1', position: [-17, 0, -25], rotationY: 0, size: 0.7 },
  // plaza centre autumn feature + seating ring
  { model: 'hayBale', position: [-36, 0, -24], rotationY: 0, size: 0.9 },
  { model: 'pumpkin2', position: [-37.6, 0, -24], rotationY: 0, size: 0.7 },
  { model: 'bench', position: [-34, 0, -24], rotationY: face(-34, -24), size: 1.7 },
  { model: 'bench', position: [-40, 0, -25], rotationY: face(-40, -25), size: 1.7 },
  { model: 'balloon', position: [2.7, 0, -4], rotationY: 0, size: 1.6 },
  { model: 'balloon', position: [-2.9, 0, -19], rotationY: 0, size: 1.5 },
  { model: 'balloon', position: [-30, 0, -27], rotationY: 0, size: 1.5 },
];

/** Stones, fallen leaves and grass tufts scattered over the gravel for texture + life. */
const GROUND_SCATTER: Placement[] = (() => {
  const out: Placement[] = [];
  const stone = (i: number): ModelKey => (i % 2 ? 'rocks' : 'rocks2');
  let i = 0;
  for (let z = -4; z >= -19; z -= 2.4, i++) {
    out.push({ model: stone(i), position: [-3.6, 0, z], rotationY: i, size: 0.5 });
    out.push({ model: 'grassPatch', position: [3.4, 0, z + 1.2], rotationY: 0, size: 0.8 });
    if (i % 2) out.push({ model: 'leafPile', position: [3.0, 0, z - 1], rotationY: i, size: 0.8 });
  }
  for (let x = -8; x >= -30; x -= 3, i++) {
    out.push({ model: stone(i), position: [x, 0, -21.5], rotationY: i, size: 0.55 });
    out.push({ model: 'grassPatch', position: [x + 1, 0, -26.5], rotationY: 0, size: 0.8 });
    out.push({ model: 'leafPile', position: [x - 1, 0, -22], rotationY: i, size: 0.8 });
  }
  for (let a = 0; a < 8; a++) {
    const t = (a / 8) * Math.PI * 2;
    out.push({
      model: stone(a),
      position: [-37 + Math.cos(t) * 6, 0, -24 + Math.sin(t) * 6],
      rotationY: a,
      size: 0.5,
    });
  }
  return out;
})();

/** Extra decoration — signage, speakers, bunting poles, prizes, litter. */
const DECOR: Placement[] = [
  { model: 'buntingPole', position: [-5.5, 0, -4], rotationY: 0, size: 3.4 },
  { model: 'buntingPole', position: [5.5, 0, -4], rotationY: 0, size: 3.4 },
  { model: 'buntingPole', position: [-6, 0, -24], rotationY: 0, size: 3.4 },
  { model: 'buntingPole', position: [-30, 0, -18], rotationY: 0, size: 3.4 },
  { model: 'loudspeaker', position: [-5.5, 2.6, -9], rotationY: ROT_LEFT, size: 0.9 },
  { model: 'loudspeaker', position: [5.5, 2.6, -15], rotationY: ROT_RIGHT, size: 0.9 },
  { model: 'loudspeaker', position: [-40, 3, -18], rotationY: face(-40, -18), size: 0.9 },
  { model: 'signTickets', position: [4.6, 1.9, -3], rotationY: ROT_RIGHT, size: 1.6 },
  { model: 'signFood', position: [-14, 2.4, -19.5], rotationY: Math.PI, size: 1.8 },
  { model: 'signBillboard', position: [11, 0, -6], rotationY: ROT_RIGHT, size: 3.4 },
  { model: 'papers', position: [-2, 0, -10], rotationY: 0.4, size: 0.6 },
  { model: 'papers', position: [2.2, 0, -16], rotationY: 1.2, size: 0.6 },
  { model: 'papers', position: [-18, 0, -24.5], rotationY: 0.8, size: 0.6 },
  { model: 'rubberDucky', position: [-26, 0.8, -20], rotationY: 0, size: 0.4 },
  { model: 'plushiesHanging2', position: [4.2, 1.4, -7], rotationY: ROT_RIGHT, size: 1.2 },
  { model: 'plushiesPinned', position: [-4.2, 1.3, -12], rotationY: ROT_LEFT, size: 1.0 },
  { model: 'balloon', position: [-5, 0, -20], rotationY: 0, size: 1.4 },
  { model: 'balloon', position: [-40, 0, -28], rotationY: 0, size: 1.5 },
  { model: 'barrel', position: [-32, 0, -20], rotationY: 0, size: 0.9 },
  { model: 'crate2', position: [-46, 0, -30], rotationY: 0.3, size: 0.9 },
];

/** Spooky zone (Nick to review) — a fortune-teller corner + a haunted nook + carved pumpkins. */
const SPOOKY: Placement[] = [
  // fortune-teller corner at the ring tent
  { model: 'stool', position: [4.0, 0, -7.6], rotationY: 0, size: 0.7 },
  { model: 'crystalBall', position: [4.0, 0.75, -7.6], rotationY: 0, size: 0.5 },
  { model: 'skull', position: [4.6, 0, -6.6], rotationY: 0.5, size: 0.5 },
  { model: 'spider1', position: [5.2, 1.6, -7], rotationY: 0, size: 0.5 },
  // haunted nook behind the food row
  { model: 'skeleton', position: [-22, 0, -33], rotationY: 0.5, size: 2.0 },
  { model: 'jack1', position: [-20.5, 0, -32], rotationY: 0, size: 0.8 },
  { model: 'jack2', position: [-23.5, 0, -32.5], rotationY: 0.6, size: 0.8 },
  { model: 'jack3', position: [-21.5, 0, -33.5], rotationY: 1.2, size: 0.7 },
  { model: 'spider2', position: [-24.5, 0, -33], rotationY: 0, size: 0.7 },
  { model: 'clownBox', position: [-19, 0, -33.5], rotationY: 0.3, size: 1.1 },
  { model: 'laughingClown', position: [-25.5, 0, -34], rotationY: 0.4, size: 1.8 },
  { model: 'jackInBox', position: [-18, 0, -32], rotationY: 0, size: 0.9 },
  { model: 'monkey', position: [-26.5, 0, -32.5], rotationY: 0, size: 0.8 },
  // carved pumpkins sprinkled at the bend (spooky-autumn)
  { model: 'jack1', position: [-3.5, 0, -22], rotationY: 0, size: 0.8 },
  { model: 'jack2', position: [-2.5, 0, -21], rotationY: 0.5, size: 0.7 },
];

export const DENSE_PLACEMENTS: Placement[] = [
  ...CLUSTER_SPOTS.flatMap(([x, z], i) => scatterCluster(x, z, i)),
  ...STALL_DRESSING,
  ...GROUND_SCATTER,
  ...FILLERS,
  ...DECOR,
  ...SPOOKY,
];

/* ── Lighting fixtures ──────────────────────────────────────────────────── */

export interface Lamp {
  position: Vec3;
  lit?: boolean;
}

/** Lamp posts down both road legs + a plaza ring; lit ones cast warm pools on the gravel. */
export const LAMP_PLACEMENTS: Lamp[] = [
  // games corridor edges
  ...[-6, -12, -18].flatMap((z, i): Lamp[] => [
    { position: [-5.7, 0, z], lit: i % 2 === 0 },
    { position: [5.7, 0, z], lit: i % 2 === 1 },
  ]),
  // food corridor edges
  ...[-12, -20, -28].flatMap((x, i): Lamp[] => [
    { position: [x, 0, -21], lit: i % 2 === 0 },
    { position: [x, 0, -27.5], lit: i % 2 === 1 },
  ]),
  // plaza ring
  ...[0, 1, 2, 3, 4, 5].map((a): Lamp => {
    const t = (a / 6) * Math.PI * 2;
    return { position: [-37 + Math.cos(t) * 9.5, 0, -24 + Math.sin(t) * 9.5], lit: a % 2 === 0 };
  }),
];

export const LAMP_SIZE = 3.6;
export const LAMP_BULB_Y = 3.1;

/** Warm hanging lanterns at the bend + a couple of clusters (glow + small pool). */
export const LANTERN_PLACEMENTS: Vec3[] = [
  [-3, 0, -21],
  [-16, 0, -22],
  [-37, 0, -24],
];

/** Overhead bunting + string lights spanning each road leg. */
export const FLAG_PLACEMENTS: Placement[] = [
  { model: 'flags', position: [0, 3.2, -6], rotationY: 0, size: 4.5 },
  { model: 'flags', position: [0, 3.2, -13], rotationY: 0, size: 4.5 },
  { model: 'flags', position: [-12, 3.2, -24], rotationY: ROT_LEFT, size: 4.5 },
  { model: 'flags', position: [-22, 3.2, -24], rotationY: ROT_LEFT, size: 4.5 },
];

/** Fencing — lines both road legs, a gate at the entrance, barricades queueing the rides. */
export const FENCE_PLACEMENTS: Placement[] = (() => {
  const out: Placement[] = [];
  // games corridor edges (run along Z)
  for (let z = -4; z >= -18; z -= 2.2) {
    out.push({ model: 'fence', position: [-6.6, 0, z], rotationY: ROT_LEFT, size: 2.3 });
    out.push({ model: 'fence', position: [6.6, 0, z], rotationY: ROT_RIGHT, size: 2.3 });
  }
  // food corridor edges (run along X)
  for (let x = -8; x >= -30; x -= 2.2) {
    out.push({ model: 'fence', position: [x, 0, -18.5], rotationY: 0, size: 2.3 });
    out.push({ model: 'fence', position: [x, 0, -29.5], rotationY: 0, size: 2.3 });
  }
  // entrance gate flanking the arch
  out.push({ model: 'fenceGate', position: [-5.4, 0, -3], rotationY: ROT_LEFT, size: 2.6 });
  out.push({ model: 'fenceGate', position: [5.4, 0, -3], rotationY: ROT_RIGHT, size: 2.6 });
  // barricades queueing the ferris + bumper arena
  out.push({ model: 'barricade1', position: [-41, 0, -22], rotationY: 0.4, size: 2.2 });
  out.push({ model: 'barricade2', position: [-39, 0, -22.5], rotationY: 0.4, size: 2.2 });
  out.push({ model: 'barricadeConn', position: [-40, 0, -22.2], rotationY: 0.4, size: 0.6 });
  out.push({ model: 'barricade3', position: [-41, 0, -19], rotationY: 1.6, size: 2.2 });
  return out;
})();
