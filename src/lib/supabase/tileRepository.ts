import type { SupabaseClient } from '@supabase/supabase-js';

import type { TileRepository } from '@/lib/doodle-wall/ports';
import type { Tile, TileStatus } from '@/lib/doodle-wall/types';

import { TILES_BUCKET } from './tileImageStore';

/**
 * Supabase Postgres implementation of the TileRepository port, over the
 * `tiles` table (supabase/migrations/*_doodle_wall.sql). Dormant until Nick
 * provisions the project — never constructed in stub mode. Runs with the
 * service-role client; the service layer enforces every rule the RLS
 * policies also enforce.
 */

const TILE_COLUMNS = 'id, image_path, status, submitter_hash, created_at';

interface TileRow {
  id: string;
  image_path: string;
  status: TileStatus;
  submitter_hash: string;
  created_at: string;
}

export class SupabaseTileRepository implements TileRepository {
  constructor(private readonly client: SupabaseClient) {}

  async insert(tile: Tile): Promise<void> {
    const { error } = await this.client.from('tiles').insert({
      id: tile.id,
      image_path: tile.imagePath,
      status: tile.status,
      submitter_hash: tile.submitterHash,
      created_at: tile.createdAt,
    });
    if (error) throw new Error(`[doodle-wall] tile insert failed: ${error.message}`);
  }

  async recentApproved(limit: number): Promise<Tile[]> {
    const { data, error } = await this.client
      .from('tiles')
      .select(TILE_COLUMNS)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(`[doodle-wall] wall query failed: ${error.message}`);
    return ((data ?? []) as TileRow[]).map((row) => this.toTile(row));
  }

  async countSubmittedSince(submitterHash: string, sinceIso: string): Promise<number> {
    const { count, error } = await this.client
      .from('tiles')
      .select('id', { count: 'exact', head: true })
      .eq('submitter_hash', submitterHash)
      .gte('created_at', sinceIso);
    if (error) throw new Error(`[doodle-wall] daily-cap count failed: ${error.message}`);
    return count ?? 0;
  }

  async oldestPending(limit: number): Promise<Tile[]> {
    const { data, error } = await this.client
      .from('tiles')
      .select(TILE_COLUMNS)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw new Error(`[doodle-wall] queue query failed: ${error.message}`);
    return ((data ?? []) as TileRow[]).map((row) => this.toTile(row));
  }

  async findById(id: string): Promise<Tile | null> {
    const { data, error } = await this.client
      .from('tiles')
      .select(TILE_COLUMNS)
      .eq('id', id)
      .maybeSingle();
    // 22P02 = invalid uuid syntax: a malformed id is "no such tile" (the
    // fakes return null too), not a 500 — the column is uuid-typed.
    if (error?.code === '22P02') return null;
    if (error) throw new Error(`[doodle-wall] tile lookup failed: ${error.message}`);
    return data ? this.toTile(data as TileRow) : null;
  }

  async setStatus(id: string, status: TileStatus): Promise<void> {
    // approved_at lives only in the database (the domain Tile doesn't carry
    // it): set on approve, cleared on any other transition.
    const { error } = await this.client
      .from('tiles')
      .update({ status, approved_at: status === 'approved' ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) throw new Error(`[doodle-wall] status update failed: ${error.message}`);
  }

  private toTile(row: TileRow): Tile {
    // getPublicUrl is a synchronous URL construction — no network call.
    const { data } = this.client.storage.from(TILES_BUCKET).getPublicUrl(row.image_path);
    return {
      id: row.id,
      imagePath: row.image_path,
      imageUrl: data.publicUrl,
      status: row.status,
      submitterHash: row.submitter_hash,
      createdAt: row.created_at,
    };
  }
}
