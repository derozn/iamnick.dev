/**
 * Attractions — the demo structures (three.js coords) wired to CV content, in
 * **walk order**. As the camera walks the carnival it holds briefly at each; a
 * clickable glowing marker floats over the structure, and clicking opens that
 * section in the neon HUD overlay (click-to-step-in).
 *
 * Career Highlights = a **row of tents/stalls, one per role, earliest → present**
 * (Nick's lean: "select a specific tent = a job"). Positions are real Demo.unity
 * structure locations; `cam`/`look` choreograph the first-person stop at each.
 */
export type V3 = [number, number, number];

export interface Attraction {
  id: string;
  title: string;
  section: string;
  /** Glowing marker position (floats over the structure). */
  marker: V3;
  /** Camera viewing position when stopped at this attraction. */
  cam: V3;
  /** Camera look target (the structure). */
  look: V3;
}

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'intro',
    title: 'Nick de Rozarieux',
    section: 'intro',
    marker: [-1.8, 4.3, -30.7],
    cam: [-1.9, 3.4, -37],
    look: [-1.8, 2.6, -30.7],
  },
  {
    id: 'about',
    title: 'About',
    section: 'about',
    marker: [-13.3, 4.3, -22.6],
    cam: [-6.8, 3.4, -27.6],
    look: [-13.3, 2.6, -22.6],
  },

  // Career Highlights — earliest → present, a structure each
  {
    id: 'vitamin',
    title: 'Vitamin London',
    section: 'role:vitamin-london-fe',
    marker: [-18.1, 4.3, -16.7],
    cam: [-8.4, 3.4, -21.7],
    look: [-18.1, 2.6, -16.7],
  },
  {
    id: 'arcadia',
    title: 'Arcadia Group',
    section: 'role:arcadia-senior',
    marker: [1.2, 4.6, -15.4],
    cam: [-0.7, 3.4, -20.4],
    look: [1.2, 2.8, -15.4],
  },
  {
    id: 'yoti',
    title: 'Yoti',
    section: 'role:yoti-senior-fe',
    marker: [1.3, 4.3, -12.5],
    cam: [-0.7, 3.4, -17.5],
    look: [1.3, 2.6, -12.5],
  },
  {
    id: 'lyvly',
    title: 'Lyvly',
    section: 'role:lyvly-fullstack',
    marker: [-5.5, 4.3, -11.1],
    cam: [-3.4, 3.4, -16.1],
    look: [-5.5, 2.6, -11.1],
  },
  {
    id: 'gousto',
    title: 'Gousto',
    section: 'role:gousto-senior',
    marker: [-8.9, 4.3, -7],
    cam: [-5.1, 3.4, -12],
    look: [-8.9, 2.6, -7],
  },
  {
    id: 'lick',
    title: 'Lick',
    section: 'role:lick-tech-lead',
    marker: [-8.8, 4.3, -2.4],
    cam: [-5.1, 3.4, -7.4],
    look: [-8.8, 2.6, -2.4],
  },
  {
    id: 'travelex',
    title: 'Travelex',
    section: 'role:travelex-lead',
    marker: [-5.8, 4.3, -1.9],
    cam: [-3.7, 3.4, -6.9],
    look: [-5.8, 2.6, -1.9],
  },

  {
    id: 'projects',
    title: 'Side Projects',
    section: 'projects',
    marker: [-4.6, 4.3, 10.5],
    cam: [-3, 3.4, 5.5],
    look: [-4.6, 2.6, 10.5],
  },
  // finale: framed on the lit ferris wheel (its own neon accent)
  {
    id: 'contact',
    title: 'Contact',
    section: 'contact',
    marker: [-14, 5, 24],
    cam: [-7, 4.5, 13],
    look: [-22, 7, 29],
  },
];
