import { beforeEach, describe, expect, it } from 'vitest';

import { SUBMIT_DAILY_CAP, TILE_MAX_BYTES, WALL_TILE_COUNT } from './constants';
import {
  InMemoryTileImageStore,
  InMemoryTileRepository,
  makeNoisePng,
  makeSolidPng,
  seedApprovedTiles,
} from './fakes';
import { createTileService, type TileService } from './tileService';
import type { Tile } from './types';

/** Service tests run against the in-memory fakes only — no HTTP, no network. */

const VALID_PNG = makeSolidPng(256, [255, 64, 129]);
const HASH = 'a'.repeat(64);

let repository: InMemoryTileRepository;
let service: TileService;

beforeEach(() => {
  repository = new InMemoryTileRepository();
  service = createTileService({ repository, imageStore: new InMemoryTileImageStore() });
});

const submit = (imageBytes: Uint8Array = VALID_PNG, submitterHash = HASH) =>
  service.submitTile({ imageBytes, submitterHash });

describe('tileService.submitTile — validation', () => {
  it('accepts a valid 256×256 PNG and stores path + url', async () => {
    const result = await submit();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tile.imagePath).toMatch(/\.png$/);
    expect(result.tile.imageUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.tile.submitterHash).toBe(HASH);
  });

  it('rejects non-PNG bytes as invalid-image', async () => {
    const result = await submit(new TextEncoder().encode('<svg/>'.padEnd(64, ' ')));
    expect(result).toEqual({ ok: false, reason: 'invalid-image' });
    expect(repository.all()).toHaveLength(0);
  });

  it('rejects a PNG that is not exactly 256×256', async () => {
    expect(await submit(makeSolidPng(512, [0, 0, 0]))).toEqual({
      ok: false,
      reason: 'invalid-image',
    });
    expect(await submit(makeSolidPng(255, [0, 0, 0]))).toEqual({
      ok: false,
      reason: 'invalid-image',
    });
  });

  it('rejects bytes over the cap as too-large, before any parsing', async () => {
    const oversized = makeNoisePng(256);
    expect(oversized.byteLength).toBeGreaterThan(TILE_MAX_BYTES);
    expect(await submit(oversized)).toEqual({ ok: false, reason: 'too-large' });
    expect(repository.all()).toHaveLength(0);
  });
});

describe('tileService.submitTile — pending is forced', () => {
  it('stores every accepted tile as pending', async () => {
    const result = await submit();
    expect(result.ok && result.tile.status === 'pending').toBe(true);
    expect(repository.all()[0].status).toBe('pending');
  });

  it('ignores a smuggled approved status from the caller', async () => {
    // The input type has no status field; a hostile caller forcing one
    // through must still land in the pre-moderation queue.
    const smuggled = { imageBytes: VALID_PNG, submitterHash: HASH, status: 'approved' };
    const result = await service.submitTile(smuggled as never);
    expect(result.ok).toBe(true);
    expect(repository.all()[0].status).toBe('pending');
    expect(await service.getWall()).toHaveLength(0);
  });
});

describe('tileService.submitTile — daily cap', () => {
  it(`rejects the ${SUBMIT_DAILY_CAP + 1}th same-hash submission inside 24 h`, async () => {
    for (let i = 0; i < SUBMIT_DAILY_CAP; i++) {
      expect((await submit()).ok).toBe(true);
    }
    expect(await submit()).toEqual({ ok: false, reason: 'daily-cap' });
    // A different submitter is unaffected.
    expect((await submit(VALID_PNG, 'b'.repeat(64))).ok).toBe(true);
  });

  it('accepts again once the 24 h window rolls past old submissions', async () => {
    const staleIso = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    for (let i = 0; i < SUBMIT_DAILY_CAP; i++) {
      await repository.insert(makeStoredTile({ submitterHash: HASH, createdAt: staleIso }));
    }
    expect((await submit()).ok).toBe(true);
  });
});

describe('tileService.getWall', () => {
  it('returns only approved tiles, newest first, projected to public fields', async () => {
    repository = new InMemoryTileRepository(seedApprovedTiles());
    service = createTileService({ repository, imageStore: new InMemoryTileImageStore() });
    await submit(); // pending — must never surface
    const wall = await service.getWall();
    expect(wall).toHaveLength(seedApprovedTiles().length);
    // The projection happens at the domain boundary: no status, and — the
    // fields that must never leave the server — no submitterHash, no imagePath.
    for (const tile of wall) {
      expect(Object.keys(tile).sort()).toEqual(['createdAt', 'id', 'imageUrl']);
    }
    const createdAts = wall.map((tile) => tile.createdAt);
    expect(createdAts).toEqual([...createdAts].sort().reverse());
  });

  it(`is bounded at WALL_TILE_COUNT (${WALL_TILE_COUNT})`, async () => {
    const many = Array.from({ length: WALL_TILE_COUNT + 10 }, (_, i) =>
      makeStoredTile({
        status: 'approved',
        createdAt: new Date(Date.parse('2026-07-01T00:00:00Z') + i * 1000).toISOString(),
      }),
    );
    repository = new InMemoryTileRepository(many);
    service = createTileService({ repository, imageStore: new InMemoryTileImageStore() });
    const wall = await service.getWall();
    expect(wall).toHaveLength(WALL_TILE_COUNT);
    // Newest survive the bound.
    expect(wall[0].createdAt).toBe(many[many.length - 1].createdAt);
  });
});

describe('tileService.getQueue', () => {
  it('returns pending tiles oldest-first, projected to the public shape', async () => {
    const base = Date.parse('2026-07-01T00:00:00Z');
    repository = new InMemoryTileRepository([
      makeStoredTile({ status: 'pending', createdAt: new Date(base + 2000).toISOString() }),
      makeStoredTile({ status: 'approved', createdAt: new Date(base + 1000).toISOString() }),
      makeStoredTile({ status: 'pending', createdAt: new Date(base).toISOString() }),
      makeStoredTile({ status: 'rejected', createdAt: new Date(base + 3000).toISOString() }),
    ]);
    service = createTileService({ repository, imageStore: new InMemoryTileImageStore() });

    const queue = await service.getQueue();
    expect(queue.map((t) => t.createdAt)).toEqual([
      new Date(base).toISOString(),
      new Date(base + 2000).toISOString(),
    ]);
    // Projection: nothing beyond the public shape leaves the domain.
    expect(Object.keys(queue[0]).sort()).toEqual(['createdAt', 'id', 'imageUrl']);
  });

  it(`is bounded at QUEUE_PAGE_COUNT`, async () => {
    const { QUEUE_PAGE_COUNT } = await import('./constants');
    repository = new InMemoryTileRepository(
      Array.from({ length: QUEUE_PAGE_COUNT + 5 }, () => makeStoredTile({ status: 'pending' })),
    );
    service = createTileService({ repository, imageStore: new InMemoryTileImageStore() });
    expect(await service.getQueue()).toHaveLength(QUEUE_PAGE_COUNT);
  });
});

describe('tileService.moderate', () => {
  const withTile = (status: Tile['status']) => {
    const tile = makeStoredTile({ status });
    repository = new InMemoryTileRepository([tile]);
    service = createTileService({ repository, imageStore: new InMemoryTileImageStore() });
    return tile;
  };

  it('approves a pending tile', async () => {
    const tile = withTile('pending');
    const result = await service.moderate({ id: tile.id, verdict: 'approve' });
    expect(result).toEqual({ ok: true, id: tile.id, status: 'approved' });
    expect((await repository.findById(tile.id))?.status).toBe('approved');
  });

  it('rejects a pending tile', async () => {
    const tile = withTile('pending');
    const result = await service.moderate({ id: tile.id, verdict: 'reject' });
    expect(result).toEqual({ ok: true, id: tile.id, status: 'rejected' });
  });

  it('takes an approved tile back down (approved → rejected)', async () => {
    const tile = withTile('approved');
    const result = await service.moderate({ id: tile.id, verdict: 'reject' });
    expect(result).toEqual({ ok: true, id: tile.id, status: 'rejected' });
  });

  it('refuses to re-approve an approved tile', async () => {
    const tile = withTile('approved');
    expect(await service.moderate({ id: tile.id, verdict: 'approve' })).toEqual({
      ok: false,
      reason: 'invalid-transition',
    });
  });

  it('refuses any verdict on a rejected tile — rejection is final', async () => {
    const tile = withTile('rejected');
    for (const verdict of ['approve', 'reject'] as const) {
      expect(await service.moderate({ id: tile.id, verdict })).toEqual({
        ok: false,
        reason: 'invalid-transition',
      });
    }
  });

  it('reports an unknown id as not-found', async () => {
    withTile('pending');
    expect(await service.moderate({ id: 'no-such-tile', verdict: 'approve' })).toEqual({
      ok: false,
      reason: 'not-found',
    });
  });
});

let tileCounter = 0;

function makeStoredTile(overrides: Partial<Tile>): Tile {
  tileCounter += 1;
  return {
    id: `stored-${tileCounter}`,
    imagePath: `stored-${tileCounter}.png`,
    imageUrl: 'data:image/png;base64,',
    status: 'pending',
    submitterHash: HASH,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
