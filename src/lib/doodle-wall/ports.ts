import type { Tile } from './types';

/**
 * Ports the tileService depends on — one interface per dependency direction.
 * Implemented in-memory by ./fakes.ts (dev, CI, keyless production) and by
 * src/lib/supabase/ once Nick provisions the project. The service never
 * knows which one it holds.
 */

export interface TileRepository {
  insert(tile: Tile): Promise<void>;
  /** Most-recent approved tiles, newest first, at most `limit`. */
  recentApproved(limit: number): Promise<Tile[]>;
  /**
   * Rows for a submitter hash created at or after `sinceIso` — the durable
   * daily-cap count, counted through the store so it survives serverless
   * instance churn.
   */
  countSubmittedSince(submitterHash: string, sinceIso: string): Promise<number>;
}

export interface TileImageStore {
  /** Persist validated PNG bytes; returns the storage path + public URL. */
  store(bytes: Uint8Array): Promise<{ path: string; url: string }>;
  /**
   * Delete a stored image — the compensation path when the row insert fails
   * after the upload, so the bucket never accretes PNGs no row references.
   */
  remove(path: string): Promise<void>;
}
