import { randomUUID } from 'node:crypto';

import { STORED_TILE_SIZE, SUBMIT_DAILY_CAP, TILE_MAX_BYTES, WALL_TILE_COUNT } from './constants';
import { readPngDimensions } from './png';
import type { TileImageStore, TileRepository } from './ports';
import type { Tile } from './types';

/**
 * The doodle wall's submit and wall rules, pure of HTTP and of Supabase.
 * Every rule the RLS policies also enforce is enforced here first — RLS is
 * the backstop, not the only line (docs/adr/0001).
 */

export type SubmitTileResult =
  { ok: true; tile: Tile } | { ok: false; reason: 'invalid-image' | 'too-large' | 'daily-cap' };

export interface TileService {
  submitTile(input: { imageBytes: Uint8Array; submitterHash: string }): Promise<SubmitTileResult>;
  /** Most-recent approved tiles, newest first, bounded at WALL_TILE_COUNT. */
  getWall(): Promise<Tile[]>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function createTileService(deps: {
  repository: TileRepository;
  imageStore: TileImageStore;
}): TileService {
  const { repository, imageStore } = deps;

  return {
    async submitTile({ imageBytes, submitterHash }) {
      // Byte ceiling before anything else — cheapest check on untrusted input.
      if (imageBytes.byteLength > TILE_MAX_BYTES) return { ok: false, reason: 'too-large' };

      // Server-side PNG validation: exact signature + IHDR dimensions. The
      // client canvas exports 256×256, but the client is never trusted.
      const dimensions = readPngDimensions(imageBytes);
      if (
        !dimensions ||
        dimensions.width !== STORED_TILE_SIZE ||
        dimensions.height !== STORED_TILE_SIZE
      ) {
        return { ok: false, reason: 'invalid-image' };
      }

      // Durable daily cap, counted through the repository so it survives
      // serverless instance churn (unlike the route's in-memory burst guard).
      const since = new Date(Date.now() - DAY_MS).toISOString();
      const submittedToday = await repository.countSubmittedSince(submitterHash, since);
      if (submittedToday >= SUBMIT_DAILY_CAP) return { ok: false, reason: 'daily-cap' };

      const stored = await imageStore.store(imageBytes);
      // Status is forced 'pending' — no caller can supply one; every tile
      // enters the pre-moderation queue (CONTEXT.md).
      const tile: Tile = {
        id: randomUUID(),
        imagePath: stored.path,
        imageUrl: stored.url,
        status: 'pending',
        submitterHash,
        createdAt: new Date().toISOString(),
      };
      await repository.insert(tile);
      return { ok: true, tile };
    },

    async getWall() {
      return repository.recentApproved(WALL_TILE_COUNT);
    },
  };
}
