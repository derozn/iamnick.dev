/**
 * midway.config — single tuning surface for the on-rails Dark Carnival.
 *
 * The Midway is the scroll-driven spine: the camera travels it as the visitor
 * scrolls, performing a cinematic "arrival" at each attraction. Attractions are
 * laid out along a gently winding descending path (x, y AND z vary so travel
 * feels dimensional). One camera control point per attraction; the camera flies
 * a CatmullRom curve through `position + camOffset` and eases its look-at toward
 * `position + lookAtOffset`.
 *
 * Framing rule: the look-at target is shifted TOWARD the content card's side,
 * which pushes the attraction to the OPPOSITE half of the viewport.
 *
 * Attraction order matches the DOM section order and the Midway in PLAN.md.
 * Career Highlights run **earliest → present**: the `earlier` cluster opens the
 * run, the current role (`travelex`) closes it. The ball-toss and doodle-wall
 * stalls are not on the spine yet — they join in Phase 3 / Phase 4 with their own
 * DOM + step-in (see TODO below).
 */

export type AttractionId =
  | 'header'
  | 'earlier'
  | 'gousto'
  | 'lick'
  | 'travelex'
  | 'projects'
  | 'contact';
// TODO(phase-3): insert 'ball-toss' stall between 'travelex' and 'projects'.
// TODO(phase-4): append 'doodle-wall' stall after 'contact'.

export type Vec3 = [number, number, number];

export interface MidwayAttraction {
  id: AttractionId;
  /** Attraction centre in world space. */
  position: Vec3;
  /** Uniform scale applied to the attraction group. */
  scale: number;
  /** Camera control point, relative to `position`. */
  camOffset: { desktop: Vec3; mobile: Vec3 };
  /** Look-at target, relative to `position` (shift toward card side ⇒ attraction shows opposite). */
  lookAtOffset: { desktop: Vec3; mobile: Vec3 };
}

/** Ordered along the Midway — order must match the DOM section order. */
export const MIDWAY_ATTRACTIONS: MidwayAttraction[] = [
  {
    id: 'header', // Entrance — card bottom-left → framed above/right
    position: [0, 0, 0],
    scale: 1.3,
    camOffset: { desktop: [0.7, 0.5, 2.75], mobile: [0, 0.55, 4.8] },
    lookAtOffset: { desktop: [-0.5, -0.05, 0], mobile: [0, -0.75, 0] },
  },
  {
    id: 'earlier', // opening cluster (education + earliest roles) → full-width card → framed centre
    position: [-1.8, -1.0, -5],
    scale: 1.0,
    camOffset: { desktop: [-0.3, 0.4, 2.7], mobile: [-0.05, 0.5, 4.0] },
    lookAtOffset: { desktop: [0.15, -0.4, 0], mobile: [0, -1.15, 0] },
  },
  {
    id: 'gousto', // card LEFT → attraction framed RIGHT
    position: [2.4, -1.9, -10],
    scale: 1.3,
    camOffset: { desktop: [0.6, 0.45, 2.2], mobile: [0.1, 0.55, 4.4] },
    lookAtOffset: { desktop: [-0.55, 0, 0], mobile: [0, -1.25, 0] },
  },
  {
    id: 'lick', // card RIGHT → attraction framed LEFT
    position: [-2.6, -2.9, -15],
    scale: 1.3,
    camOffset: { desktop: [-0.6, 0.4, 2.2], mobile: [-0.1, 0.55, 4.4] },
    lookAtOffset: { desktop: [0.55, 0, 0], mobile: [0, -1.25, 0] },
  },
  {
    id: 'travelex', // current role, closes the run — card LEFT → attraction framed RIGHT
    position: [2.6, -3.8, -20],
    scale: 1.3,
    camOffset: { desktop: [0.7, 0.5, 2.1], mobile: [0.1, 0.55, 4.4] },
    lookAtOffset: { desktop: [-0.55, 0.05, 0], mobile: [0, -1.25, 0] },
  },
  {
    id: 'projects', // full-width card → attraction framed above-centre
    position: [-1.6, -4.7, -25],
    scale: 1.0,
    camOffset: { desktop: [-0.3, 0.4, 2.4], mobile: [-0.05, 0.4, 3.2] },
    lookAtOffset: { desktop: [-0.2, -0.85, 0], mobile: [0, -0.95, 0] },
  },
  {
    id: 'contact',
    position: [0, -5.6, -30],
    scale: 1.0,
    camOffset: { desktop: [0, 0.45, 2.35], mobile: [0, 0.5, 3.4] },
    lookAtOffset: { desktop: [0, -0.5, 0], mobile: [0, -1.08, 0] },
  },
];

/* ── Flight feel ────────────────────────────────────────────────────────── */

/**
 * Fraction of each attraction's scroll band (around its centre) during which the
 * camera holds docked at the attraction. The remainder is smoothstepped transit.
 */
export const HOLD_FRACTION = 0.55;

/** Critically-damped smoothing times (seconds) — maath/easing damp3. */
export const POSITION_SMOOTHING = 0.35;
export const TARGET_SMOOTHING = 0.28;

/** Max roll (radians) when banking into a lateral turn; gain maps lag → roll. */
export const MAX_BANK = 0.05;
export const BANK_GAIN = 0.12;
export const BANK_SMOOTHING = 0.5;

/* ── Atmosphere ─────────────────────────────────────────────────────────── */

/** Canvas clear colour — deep night-fog blue the abandoned funfair dissolves into. */
export const BACKGROUND_COLOR = '#0a0a14';
/**
 * Fog matches the background so distant attractions dissolve into the night.
 * Near must clear the docked attraction entirely: camera sits ~2.1–2.9 out and
 * attraction geometry extends ~1.1 further, so near ≥ 4.5 keeps the docked stop
 * crisp while the next one reads as a half-dissolved silhouette in the fog.
 */
export const FOG_NEAR = 4.75;
export const FOG_FAR = 15;

export const ACCENT = '#4cc9f0';

/** Fog-mote / dust particle counts per quality tier. */
export const DUST_COUNT_HIGH = 1500;
export const DUST_COUNT_LOW = 400;
