import { createTileService } from '@/lib/doodle-wall/tileService';
import { getTileAdapters } from '@/lib/supabase/tileAdapters';

/**
 * GET /api/wall — the doodle wall: most-recent approved tiles, newest
 * first, bounded at WALL_TILE_COUNT (48). Only public fields leave the
 * server; submitter hashes and storage paths never do.
 *
 * Response: `{ tiles: [{ id, imageUrl, createdAt }] }`.
 *
 * Cacheable at the CDN — the wall is persisted, not live (no realtime,
 * ADR-0001), so a newly approved tile appearing within a minute is fine.
 */
export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

export async function GET(): Promise<Response> {
  const service = createTileService(getTileAdapters());
  // getWall already returns the public WallTile projection — private fields
  // are stripped at the domain boundary, not here.
  const tiles = await service.getWall();
  return Response.json({ tiles }, { headers: { 'Cache-Control': CACHE_CONTROL } });
}
