/**
 * Attractions + the road the camera walks.
 *
 * The camera follows **ROAD** — a polyline traced down the demo's gravel path, so
 * it never cuts through props. It pauses at each attraction's `pathT` (a point on
 * that road) and turns to face the structure's opening, the way you'd walk up to a
 * tent in a game. Six stops in CV order: the entrance sign, then one structure per
 * section (a single Work booth whose HUD lists every job), the optional ball-toss
 * game, and the Ferris wheel finale where the road curves north-west.
 */
export type V3 = [number, number, number];
export type V2 = [number, number];

/** Camera walking path (x, z) down the gravel road, south → north → NW to the wheel. */
export const ROAD: V2[] = [
  [-1.5, -37], // 0  intro (entrance)
  [-1.5, -31], // 1
  [-4, -26], // 2
  [-8.5, -23], // 3  about (west tent)
  [-4, -18], // 4
  [-1.6, -13.5], // 5  work (roadside booth)
  [-1.4, -8], // 6
  [-1.3, -5.2], // 7  ball-toss game (small stand in a busy corner — frame it back)
  [-2, 2], // 8
  [-2.2, 7], // 9  projects (roadside stall)
  [-4, 12], // 10
  [-7, 17], // 11
  [-10, 20.5], // 12
  [-11.5, 22], // 13 contact (Ferris, NW — back off to fit the wheel)
];

export interface Attraction {
  id: string;
  title: string;
  section: string;
  /** GLB key whose silhouette the neon glow traces. */
  prefab: string;
  /** Unity TRS [px,py,pz, qx,qy,qz,qw, sx,sy,sz] of the specific instance. */
  transform: number[];
  /** Position along ROAD (0..1) where the camera pauses for this stop. */
  pathT: number;
  /** Camera look target — the structure's opening, roughly mid-height. */
  look: V3;
}

const LAST = ROAD.length - 1;
/** pathT for a stop sitting on ROAD waypoint `i`. */
const at = (i: number) => i / LAST;

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'intro',
    title: 'Nick de Rozarieux',
    section: 'intro',
    prefab: 'SM_Prop_Carnival_Entrance_01',
    transform: [-1.77, 0.014, 30.719, 0, 0, 0, 1, 1, 1, 1],
    pathT: at(0),
    look: [-1.77, 3.0, -30.7],
  },
  {
    id: 'about',
    title: 'About',
    section: 'about',
    prefab: 'SM_Prop_Tent_01',
    transform: [-13.258, 0.156, 22.62, 0, 0.931, 0, 0.364, 1, 1, 1],
    pathT: at(3),
    look: [-13.26, 2.6, -22.63],
  },
  {
    id: 'work',
    title: 'Career',
    section: 'work',
    prefab: 'SM_Prop_Stall_01',
    transform: [1.3, 0.09, 12.53, 0, -0.732, 0, 0.682, 1, 1, 1],
    pathT: at(5),
    look: [1.3, 2.0, -12.53],
  },
  {
    id: 'ball-toss',
    title: 'Ball Toss',
    section: 'game:ball-toss',
    prefab: 'SM_Prop_Milk_Bottle_Toss_Stand_01',
    transform: [0.168, 1.04, -0.503, 0, -0.689, 0, 0.725, 1, 1, 1],
    pathT: at(7),
    look: [0.17, 1.5, 0.5],
  },
  {
    id: 'projects',
    title: 'Side Projects',
    section: 'projects',
    prefab: 'SM_Prop_Stall_03',
    transform: [-4.613, 0.184, -10.47, 0, 0.707, 0, 0.707, 1, 1, 1],
    pathT: at(9),
    look: [-4.61, 2.1, 10.47],
  },
  {
    id: 'contact',
    title: 'Contact',
    section: 'contact',
    prefab: 'SM_Prop_Ferris_Wheel_01',
    transform: [-22.16, 0.22, -28.6, 0, 0.312, 0, 0.95, 1, 1, 1],
    pathT: at(13),
    look: [-22.25, 8.5, 28.53],
  },
];
