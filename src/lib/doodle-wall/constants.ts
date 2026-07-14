/**
 * Doodle wall server truths — the single source for both sides of the app.
 * The API routes and tileService enforce these; the scene/overlay slice reads
 * the same values so the drawing overlay and the in-scene grid can never
 * drift from what the server accepts. All numbers were fixed in the
 * 2026-07-14 grill session (ADR-0001) — do not retune here.
 *
 * Some constants (DRAWING_CANVAS_SIZE, SCENE_TILE_COUNT) have no consumer
 * until the scene/overlay slice lands; knip noise on them is expected.
 */

/** Stored tile PNGs are exactly STORED_TILE_SIZE × STORED_TILE_SIZE pixels. */
export const STORED_TILE_SIZE = 256;

/** The drawing overlay's canvas edge — draws at 512, exports at 256. */
export const DRAWING_CANVAS_SIZE = 512;

/** Byte ceiling for a stored tile PNG (128 KB). */
export const TILE_MAX_BYTES = 131_072;

/** Upper bound on tiles returned by the wall query (GET /api/wall). */
export const WALL_TILE_COUNT = 48;

/** The in-scene grid renders the newest tiles in a fixed 6×4. */
export const SCENE_TILE_COUNT = 24;

/** Burst guard: submissions allowed per IP per minute (in-memory). */
export const SUBMIT_BURST_PER_MINUTE = 2;

/** Daily cap: submissions per submitter hash per rolling 24 h (durable). */
export const SUBMIT_DAILY_CAP = 10;
