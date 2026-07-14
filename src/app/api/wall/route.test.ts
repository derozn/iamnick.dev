import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WALL_TILE_COUNT } from '@/lib/doodle-wall/constants';
import { seedApprovedTiles } from '@/lib/doodle-wall/fakes';
import type { WallTile } from '@/lib/doodle-wall/types';
import { getTileAdapters, resetTileAdapters } from '@/lib/supabase/tileAdapters';

import { GET } from './route';

/**
 * Route-handler tests, keyless (stub mode) and offline: the factory wires
 * the in-memory fakes because no SUPABASE_* env is set.
 */

const getWall = async () => {
  const res = await GET();
  return { res, body: (await res.json()) as { tiles: WallTile[] } };
};

beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_ANON_KEY', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  resetTileAdapters();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('GET /api/wall', () => {
  it('returns the seeded approved tiles as renderable data URIs', async () => {
    const { res, body } = await getWall();
    expect(res.status).toBe(200);
    expect(body.tiles).toHaveLength(seedApprovedTiles().length);
    expect(body.tiles[0].imageUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('exposes only id, imageUrl, createdAt — never hashes or paths', async () => {
    const { body } = await getWall();
    for (const tile of body.tiles) {
      expect(Object.keys(tile).sort()).toEqual(['createdAt', 'id', 'imageUrl']);
    }
  });

  it('orders newest first', async () => {
    const { body } = await getWall();
    const createdAts = body.tiles.map((tile) => tile.createdAt);
    expect(createdAts).toEqual([...createdAts].sort().reverse());
  });

  it('excludes pending and rejected tiles', async () => {
    const repository = getTileAdapters().repository;
    const unapproved = seedApprovedTiles()[0];
    await repository.insert({ ...unapproved, id: 'held', status: 'pending' });
    await repository.insert({ ...unapproved, id: 'binned', status: 'rejected' });
    const { body } = await getWall();
    const ids = body.tiles.map((tile) => tile.id);
    expect(ids).not.toContain('held');
    expect(ids).not.toContain('binned');
  });

  it(`is bounded at WALL_TILE_COUNT (${WALL_TILE_COUNT})`, async () => {
    const repository = getTileAdapters().repository;
    const template = seedApprovedTiles()[0];
    for (let i = 0; i < WALL_TILE_COUNT + 10; i++) {
      await repository.insert({
        ...template,
        id: `extra-${i}`,
        createdAt: new Date(Date.now() + i * 1000).toISOString(),
      });
    }
    const { body } = await getWall();
    expect(body.tiles).toHaveLength(WALL_TILE_COUNT);
    // The newest inserted tile survives the bound.
    expect(body.tiles[0].id).toBe(`extra-${WALL_TILE_COUNT + 9}`);
  });

  it('sends the CDN cache header (no realtime, ADR-0001)', async () => {
    const { res } = await getWall();
    expect(res.headers.get('Cache-Control')).toBe(
      'public, s-maxage=60, stale-while-revalidate=300',
    );
  });
});
