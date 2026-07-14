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
