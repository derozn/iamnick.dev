/**
 * Attractions — CV content wired to **real demo structures along the gravel path**,
 * in walk order. The camera follows the dirt road north up the midway spine, then
 * curves north-west to the Ferris wheel finale, holding briefly at each structure.
 *
 * Each attraction names the exact Synty prefab + its authored Unity transform, so
 * the clickable **neon outline** (AttractionOutlines) traces that model precisely —
 * no floating buttons or labels. Career Highlights = one structure per role,
 * earliest → present, lining the avenue.
 */
export type V3 = [number, number, number];

export interface Attraction {
  id: string;
  title: string;
  section: string;
  /** GLB key whose silhouette the neon outline traces. */
  prefab: string;
  /** Unity TRS [px,py,pz, qx,qy,qz,qw, sx,sy,sz] of the specific instance. */
  transform: number[];
  /** Camera position on the gravel road when stopped here. */
  cam: V3;
  /** Camera look target (the structure). */
  look: V3;
}

export const ATTRACTIONS: Attraction[] = [
  // Entrance arch — the opening shot (no name on the sign)
  {
    id: 'intro',
    title: 'Nick de Rozarieux',
    section: 'intro',
    prefab: 'SM_Prop_Carnival_Entrance_01',
    transform: [-1.77, 0.014, 30.719, 0, 0, 0, 1, 1, 1, 1],
    cam: [-1.5, 3.4, -37],
    look: [-1.77, 3.4, -30.7],
  },
  {
    id: 'about',
    title: 'About',
    section: 'about',
    prefab: 'SM_Prop_Tent_01',
    transform: [-13.258, 0.156, 22.62, 0, 0.931, 0, 0.364, 1, 1, 1],
    cam: [-1.5, 3.4, -25.5],
    look: [-13.26, 2.8, -22.6],
  },

  // Career Highlights — earliest → present, one structure each, up the avenue
  {
    id: 'vitamin',
    title: 'Vitamin London',
    section: 'role:vitamin-london-fe',
    prefab: 'SM_Prop_High_Striker_02',
    transform: [1.174, 0.063, 15.403, 0, 0.707, 0, -0.707, 1, 1, 1],
    cam: [-1.4, 3.4, -18.8],
    look: [1.17, 3.0, -15.4],
  },
  {
    id: 'arcadia',
    title: 'Arcadia Group',
    section: 'role:arcadia-senior',
    prefab: 'SM_Prop_Stall_01',
    transform: [1.3, 0.09, 12.53, 0, -0.732, 0, 0.682, 1, 1, 1],
    cam: [-1.5, 3.4, -15.6],
    look: [1.3, 2.6, -12.53],
  },
  {
    id: 'yoti',
    title: 'Yoti',
    section: 'role:yoti-senior-fe',
    prefab: 'SM_Prop_Stall_02_Damaged_01',
    transform: [1.294, 0.09, 8.438, 0, -0.707, 0, 0.707, 1, 1, 1],
    cam: [-1.5, 3.4, -11.6],
    look: [1.29, 2.6, -8.44],
  },
  {
    id: 'lyvly',
    title: 'Lyvly',
    section: 'role:lyvly-fullstack',
    prefab: 'SM_Prop_Prize_Wheel_01',
    transform: [1.487, 0.035, 2.721, 0, -0.143, 0, 0.99, 1, 1, 1],
    cam: [-1.5, 3.4, -6.2],
    look: [1.49, 2.6, -2.72],
  },
  {
    id: 'gousto',
    title: 'Gousto',
    section: 'role:gousto-senior',
    prefab: 'SM_Prop_High_Striker_01',
    transform: [-6.689, 0.108, -5.366, 0, -0.089, 0, 0.996, 1, 1, 1],
    cam: [-1.2, 3.4, 1.4],
    look: [-6.69, 3.0, 5.37],
  },
  {
    id: 'lick',
    title: 'Lick',
    section: 'role:lick-tech-lead',
    prefab: 'SM_Prop_Stall_03',
    transform: [-4.613, 0.184, -10.47, 0, 0.707, 0, 0.707, 1, 1, 1],
    cam: [-1.6, 3.4, 6.6],
    look: [-4.61, 2.6, 10.47],
  },
  {
    id: 'travelex',
    title: 'Travelex',
    section: 'role:travelex-lead',
    prefab: 'SM_Prop_Swinging_Chairs_01',
    transform: [8.21, 0.21, -13.23, 0, 0, 0, 1, 1, 1, 1],
    cam: [-0.8, 3.6, 9.4],
    look: [8.21, 3.6, 13.23],
  },

  {
    id: 'projects',
    title: 'Side Projects',
    section: 'projects',
    prefab: 'SM_Prop_Dunk_Tank_01',
    transform: [-10.205, 0.131, -18.103, 0, -0.81, 0, 0.586, 1, 1, 1],
    cam: [-3.2, 3.4, 14.2],
    look: [-10.21, 2.8, 18.1],
  },
  // finale: the road curves north-west to the lit Ferris wheel
  {
    id: 'contact',
    title: 'Contact',
    section: 'contact',
    prefab: 'SM_Prop_Ferris_Wheel_01',
    transform: [-22.16, 0.22, -28.6, 0, 0.312, 0, 0.95, 1, 1, 1],
    cam: [-11, 4.4, 23.5],
    look: [-22.16, 6.0, 28.6],
  },
];
