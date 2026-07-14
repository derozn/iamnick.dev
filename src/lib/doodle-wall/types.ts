/**
 * Doodle wall domain types (see CONTEXT.md). A tile is one visitor's single
 * contribution; every submission enters the pre-moderation queue as `pending`
 * and only reaches the wall once approved (ADR-0001).
 */

export type TileStatus = 'pending' | 'approved' | 'rejected';

export interface Tile {
  /** UUID, generated server-side — never client-supplied. */
  id: string;
  /** Storage path of the 256×256 PNG (bucket-relative). */
  imagePath: string;
  /** Publicly servable URL for the PNG (a data URI in stub mode). */
  imageUrl: string;
  status: TileStatus;
  /** HMAC of the submitter's IP — abuse tracing without raw IPs at rest. */
  submitterHash: string;
  /** ISO 8601 timestamp — string, so tiles serialise as-is. */
  createdAt: string;
}

/**
 * The public projection of a Tile — the only tile shape that leaves the
 * server (GET /api/wall). No imagePath, no submitterHash: the projection is
 * applied at the domain boundary (tileService.getWall), not per consumer.
 */
export interface WallTile {
  id: string;
  imageUrl: string;
  createdAt: string;
}
