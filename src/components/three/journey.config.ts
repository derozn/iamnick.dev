/**
 * journey.config — single tuning surface for the scroll-driven 3-D journey.
 *
 * World layout: islands descend along a gently winding path (x, y AND z vary
 * so the flight feels dimensional). One camera control point per stop; the
 * camera flies a CatmullRom curve through `position + camOffset` and its
 * look-at eases toward `position + lookAtOffset`.
 *
 * Framing rule: the look-at target is shifted TOWARD the content card's side,
 * which pushes the island to the OPPOSITE half of the viewport.
 * Card sides (desktop): hero bottom-left, travelex left (index 0), lick right
 * (index 1), gousto left (index 2); remaining sections use full-width cards so
 * their islands are framed above-centre. On mobile every island is framed
 * centred above/behind the content.
 */

export type StopId =
  | 'hero'
  | 'travelex'
  | 'lick'
  | 'gousto'
  | 'earlier'
  | 'projects'
  | 'about'
  | 'contact';

export type Vec3 = [number, number, number];

export interface JourneyStop {
  id: StopId;
  /** Island centre in world space. */
  position: Vec3;
  /** Uniform scale applied to the island group. */
  scale: number;
  /** Camera control point, relative to `position`. */
  camOffset: { desktop: Vec3; mobile: Vec3 };
  /** Look-at target, relative to `position` (shift toward card side ⇒ island shows opposite). */
  lookAtOffset: { desktop: Vec3; mobile: Vec3 };
}

/** Ordered along the scroll journey — order must match the DOM section order. */
export const JOURNEY_STOPS: JourneyStop[] = [
  {
    id: 'hero',
    position: [0, 0, 0],
    scale: 1.3,
    camOffset: { desktop: [0.7, 0.5, 2.75], mobile: [0, 0.55, 4.8] },
    lookAtOffset: { desktop: [-0.5, -0.05, 0], mobile: [0, -0.75, 0] },
  },
  {
    id: 'travelex', // card LEFT → island framed RIGHT
    position: [2.4, -1.2, -5],
    scale: 1.3,
    camOffset: { desktop: [0.6, 0.45, 2.2], mobile: [0.1, 0.55, 4.4] },
    lookAtOffset: { desktop: [-0.55, 0, 0], mobile: [0, -1.25, 0] },
  },
  {
    id: 'lick', // card RIGHT → island framed LEFT
    position: [-2.6, -2.2, -10],
    scale: 1.3,
    camOffset: { desktop: [-0.6, 0.4, 2.2], mobile: [-0.1, 0.55, 4.4] },
    lookAtOffset: { desktop: [0.55, 0, 0], mobile: [0, -1.25, 0] },
  },
  {
    id: 'gousto', // card LEFT → island framed RIGHT
    position: [2.6, -3.0, -15],
    scale: 1.3,
    camOffset: { desktop: [0.7, 0.5, 2.1], mobile: [0.1, 0.55, 4.4] },
    lookAtOffset: { desktop: [-0.55, 0.05, 0], mobile: [0, -1.25, 0] },
  },
  {
    id: 'earlier', // full-width card → island above-centre
    position: [-1.8, -3.6, -20],
    scale: 1.0,
    camOffset: { desktop: [0.3, 0.35, 2.9], mobile: [0.05, 0.5, 4.0] },
    lookAtOffset: { desktop: [-0.1, -0.5, 0], mobile: [0, -1.15, 0] },
  },
  {
    id: 'projects',
    position: [1.6, -4.6, -25],
    scale: 1.0,
    camOffset: { desktop: [-0.3, 0.4, 2.4], mobile: [-0.05, 0.4, 3.2] },
    lookAtOffset: { desktop: [-0.2, -0.85, 0], mobile: [0, -0.95, 0] },
  },
  {
    id: 'about',
    position: [-2.0, -5.4, -30],
    scale: 1.0,
    camOffset: { desktop: [0.4, 0.35, 2.2], mobile: [0.05, 0.5, 4.0] },
    lookAtOffset: { desktop: [-0.55, -0.5, 0], mobile: [0, -1.15, 0] },
  },
  {
    id: 'contact',
    position: [0, -6.2, -35],
    scale: 1.0,
    camOffset: { desktop: [0, 0.45, 2.35], mobile: [0, 0.5, 3.4] },
    lookAtOffset: { desktop: [0, -0.5, 0], mobile: [0, -1.08, 0] },
  },
];

/* ── Flight feel ────────────────────────────────────────────────────────── */

/**
 * Fraction of each stop's scroll band (around its centre) during which the
 * camera holds docked at the island. The remainder is smoothstepped transit.
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

/** Canvas clear colour — sits between the legacy #252530 scene and page #070810. */
export const BACKGROUND_COLOR = '#0a0a14';
/** Fog matches the background so distant islands dissolve into the page. */
export const FOG_NEAR = 3.5;
export const FOG_FAR = 14;

export const ACCENT = '#4cc9f0';

/** Space-dust particle counts per quality tier. */
export const DUST_COUNT_HIGH = 1500;
export const DUST_COUNT_LOW = 400;
