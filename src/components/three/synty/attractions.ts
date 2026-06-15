/**
 * Attractions — the demo tents/stalls (in three.js world coords) wired to CV
 * content. As the visitor walks the carnival, each shows a clickable glowing
 * marker; clicking opens that section in the neon HUD overlay (click-to-step-in).
 *
 * `section` is a key the DOM `SectionContent` switches on. Positions are real
 * demo structure locations along the camera path (front → back). Step-1 set;
 * the full per-role row + game tents come next.
 */
export interface Attraction {
  id: string;
  title: string;
  /** Marker world position (three coords), floating above the structure. */
  position: [number, number, number];
  section: string;
}

export const ATTRACTIONS: Attraction[] = [
  { id: 'intro', title: 'Nick de Rozarieux', position: [-1.8, 4.2, -30.7], section: 'intro' },
  { id: 'about', title: 'About', position: [-13.3, 4.2, -22.6], section: 'about' },
  { id: 'travelex', title: 'Travelex', position: [-8.9, 3.8, -7], section: 'role:travelex-lead' },
  { id: 'projects', title: 'Side Projects', position: [-8.8, 3.8, -2.4], section: 'projects' },
  { id: 'contact', title: 'Contact', position: [-4.6, 3.8, 10.5], section: 'contact' },
];
