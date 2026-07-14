import { randomUUID } from 'node:crypto';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { TileImageStore } from '@/lib/doodle-wall/ports';

/** Storage bucket for tile PNGs: public read, server-only writes. */
export const TILES_BUCKET = 'tiles';

/**
 * Supabase Storage implementation of the TileImageStore port. Dormant until
 * Nick provisions the project — never constructed in stub mode.
 */
export class SupabaseTileImageStore implements TileImageStore {
  constructor(private readonly client: SupabaseClient) {}

  async store(bytes: Uint8Array): Promise<{ path: string; url: string }> {
    // Random server-side name — a user-influenced filename never reaches
    // Storage, and the content type is pinned so tiles can only ever be
    // served as image/png (tile bytes are untrusted user content).
    const path = `${randomUUID()}.png`;
    const { error } = await this.client.storage.from(TILES_BUCKET).upload(path, bytes, {
      contentType: 'image/png',
      upsert: false,
    });
    if (error) throw new Error(`[doodle-wall] tile image upload failed: ${error.message}`);
    const { data } = this.client.storage.from(TILES_BUCKET).getPublicUrl(path);
    return { path, url: data.publicUrl };
  }

  async remove(path: string): Promise<void> {
    const { error } = await this.client.storage.from(TILES_BUCKET).remove([path]);
    if (error) throw new Error(`[doodle-wall] tile image removal failed: ${error.message}`);
  }
}
