/**
 * Attractions — the points of interest in the isometric carnival. Each is a real
 * Synty structure with a floating indicator; clicking it flies the camera in and
 * opens that section's content. `position` is the structure's world centre (the
 * camera's focus target + where the indicator floats); `transform` is its authored
 * Unity placement, kept for the focus highlight.
 */
export type V3 = [number, number, number];

export interface Attraction {
  id: string;
  title: string;
  section: string;
  /** GLB key of the structure (for an optional focus highlight). */
  prefab: string;
  /** Unity TRS [px,py,pz, qx,qy,qz,qw, sx,sy,sz] of the instance. */
  transform: number[];
  /** World centre — indicator anchor + camera focus target. */
  position: V3;
  /** Unit direction the structure's opening faces — the camera sits on this side when focused. */
  facing: V3;
  /** How far in front of the opening the camera stops when focused. */
  focusDist: number;
}

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'intro',
    title: 'Nick de Rozarieux',
    section: 'intro',
    prefab: 'SM_Prop_Carnival_Entrance_01',
    transform: [-1.77, 0.014, 30.719, 0, 0, 0, 1, 1, 1, 1],
    position: [-1.77, 2.4, -30.7],
    facing: [0, 0, -1],
    focusDist: 11,
  },
  {
    id: 'about',
    title: 'About',
    section: 'about',
    prefab: 'SM_Prop_Tent_01',
    transform: [-13.258, 0.156, 22.62, 0, 0.931, 0, 0.364, 1, 1, 1],
    position: [-13.26, 2.4, -22.63],
    facing: [0.68, 0, -0.73],
    focusDist: 9,
  },
  {
    id: 'work',
    title: 'Career',
    section: 'work',
    prefab: 'SM_Prop_Stall_03',
    transform: [-4.613, 0.184, -10.47, 0, 0.707, 0, 0.707, 1, 1, 1],
    position: [-4.61, 1.7, 10.47],
    facing: [-1, 0, 0],
    focusDist: 8,
  },
  {
    id: 'projects',
    title: 'Side Projects',
    section: 'projects',
    prefab: 'SM_Prop_Tent_01',
    transform: [14.948, 0.16, 2.609, 0, -0.533, 0, 0.846, 0.93, 0.93, 0.93],
    position: [14.9, 2.4, -2.6],
    facing: [-0.9, 0, 0.44],
    focusDist: 9,
  },
  {
    id: 'contact',
    title: 'Contact',
    section: 'contact',
    prefab: 'SM_Prop_Ferris_Wheel_01',
    transform: [-22.16, 0.22, -28.6, 0, 0.312, 0, 0.95, 1, 1, 1],
    position: [-22.25, 6.0, 28.53],
    facing: [0, 0, -1],
    focusDist: 20,
  },
  {
    id: 'ball-toss',
    title: 'Ball Toss',
    section: 'game:ball-toss',
    prefab: 'SM_Prop_Stall_02',
    transform: [13, 0.1, 12, 0, 0.38268, 0, 0.92388, 1, 1, 1],
    position: [13, 1.7, -12],
    facing: [-0.707, 0, -0.707],
    focusDist: 8,
  },
];
