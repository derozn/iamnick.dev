import {
  DRAWING_CANVAS_SIZE,
  SCENE_TILE_COUNT,
  STORED_TILE_SIZE,
  SUBMIT_BURST_PER_MINUTE,
  SUBMIT_DAILY_CAP,
  TILE_MAX_BYTES,
  WALL_TILE_COUNT,
} from '@/lib/doodle-wall/constants';

/**
 * Doodle-wall tuning config — the stall's board layout and the overlay's
 * drawing tools, in one three-free module (NO `three` / `@react-three/*`
 * imports: DoodleWallHud lives in the static bundle and imports this file).
 *
 * The server truths below are RE-EXPORTED from `src/lib/doodle-wall/constants.ts`
 * — never redefined here — so the overlay and the in-scene grid can't drift
 * from what `/api/tiles` accepts. Everything else is presentation tuning,
 * fixed in the 2026-07-14 grill session (see doodle-wall-handoff §5).
 */

export {
  DRAWING_CANVAS_SIZE,
  SCENE_TILE_COUNT,
  STORED_TILE_SIZE,
  SUBMIT_BURST_PER_MINUTE,
  SUBMIT_DAILY_CAP,
  TILE_MAX_BYTES,
  WALL_TILE_COUNT,
};

/** One approved tile as `GET /api/wall` serves it (`imageUrl` is a data URI in
 *  stub mode, an https Storage URL once Supabase is live — handle both). */
export interface WallTile {
  id: string;
  imageUrl: string;
  createdAt: string;
}

/* --- In-scene board: a fixed 6×4 grid of the newest approved tiles --- */

/** Grid shape — cols × rows must equal SCENE_TILE_COUNT (asserted in tests). */
export const GRID_COLS = 6;
export const GRID_ROWS = 4;

/** Edge of one tile plane on the board (metres). */
export const TILE_SIZE = 0.38;
/** Gap between neighbouring tiles (metres). */
export const TILE_GAP = 0.07;
/** Centre-to-centre distance between neighbouring tiles. */
export const TILE_PITCH = TILE_SIZE + TILE_GAP;
/** Half-width of the emissive frame line drawn around each tile (metres). */
export const FRAME_LINE = 0.015;

/** Board margin outside the outermost tiles (metres). */
export const BOARD_MARGIN = 0.16;
/** Board face dimensions (metres) — the grid plus its margin. */
export const BOARD_W = GRID_COLS * TILE_PITCH - TILE_GAP + 2 * BOARD_MARGIN;
export const BOARD_H = GRID_ROWS * TILE_PITCH - TILE_GAP + 2 * BOARD_MARGIN;
/** Board slab thickness (metres). */
export const BOARD_DEPTH = 0.06;

/**
 * Board centre in three world space + yaw (radians about Y). The stall prefab
 * sits at three (-12.5, 31.5) yaw 135° (sceneAdditions); the board hangs at its
 * back wall, facing SW down the Midway toward the iso camera. Iterated visually
 * via headless screenshots — these two are THE placement knobs.
 */
export const BOARD_CENTER: readonly [number, number, number] = [-12.08, 1.72, 31.92];
/** Yaw so the board's face (+z of its group) points SW, matching the stall. */
export const BOARD_YAW = -Math.PI * 0.75;

/** Practical bulb spacing along the board's edge (metres). */
export const BULB_SPACING = 0.34;
/** How far outside the board edge the bulb string hangs (metres). */
export const BULB_INSET = 0.1;
/** Warm practical-bulb colour (matches the scene's lamp warmth, #ff9a3c family). */
export const BULB_COLOR = '#ffd9a0';

/**
 * Local x/y (metres, board plane, y-up) of a tile's centre for its wall index,
 * row-major from the top-left — index 0 (the newest tile) reads first, like a
 * page. Deterministic: same index, same spot.
 */
export function tileGridPosition(index: number): { x: number; y: number } {
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  return {
    x: (col - (GRID_COLS - 1) / 2) * TILE_PITCH,
    y: ((GRID_ROWS - 1) / 2 - row) * TILE_PITCH,
  };
}

/* --- Drawing overlay: tools fixed by the 2026-07-14 grill session --- */

/** The tile ground every drawing starts from — near-black carnival night. */
export const TILE_GROUND = '#12101c';

/**
 * The neon inks — six hues drawn from the scene's established bulb/neon
 * palette (DynamicLights ride accents + the warm lamp pool + the moon key),
 * so a tile can only ever glow in colours the carnival already wears.
 */
export const INK_PALETTE: readonly { name: string; hex: string }[] = [
  { name: 'Ferris cyan', hex: '#22d3ee' },
  { name: 'Carousel pink', hex: '#ff2d6e' },
  { name: 'Teacup violet', hex: '#b06cff' },
  { name: 'Chair-swing amber', hex: '#ffb84d' },
  { name: 'Lamplight ember', hex: '#ff9a3c' },
  { name: 'Moonlight blue', hex: '#aab6f0' },
];

/** Brush diameters (px on the 512 drawing canvas): fine / medium / broad. */
export const BRUSH_SIZES: readonly number[] = [6, 14, 26];

/** How many strokes the visitor can step back through. */
export const UNDO_DEPTH = 20;

/** Minimum time the submitting state shows, so it never flashes (ms). */
export const SUBMIT_FEEDBACK_MIN_MS = 450;
