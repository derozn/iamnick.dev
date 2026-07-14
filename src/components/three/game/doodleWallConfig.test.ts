import { describe, expect, it } from 'vitest';

import {
  BOARD_H,
  BOARD_W,
  BRUSH_SIZES,
  GRID_COLS,
  GRID_ROWS,
  INK_PALETTE,
  SCENE_TILE_COUNT,
  TILE_GROUND,
  TILE_PITCH,
  tileGridPosition,
  UNDO_DEPTH,
} from './doodleWallConfig';

/** The 6×4 in-scene grid — deterministic tile placement on the board. */
describe('tileGridPosition', () => {
  it('the grid shape covers exactly the scene tile count (6×4 = 24)', () => {
    expect(GRID_COLS * GRID_ROWS).toBe(SCENE_TILE_COUNT);
  });

  it('index 0 (the newest tile) sits top-left', () => {
    const p = tileGridPosition(0);
    expect(p.x).toBeLessThan(0);
    expect(p.y).toBeGreaterThan(0);
  });

  it('reads row-major like a page: one step right per index, one pitch down per row', () => {
    const first = tileGridPosition(0);
    const second = tileGridPosition(1);
    expect(second.x - first.x).toBeCloseTo(TILE_PITCH);
    expect(second.y).toBeCloseTo(first.y);

    const nextRow = tileGridPosition(GRID_COLS);
    expect(nextRow.x).toBeCloseTo(first.x);
    expect(first.y - nextRow.y).toBeCloseTo(TILE_PITCH);
  });

  it('centres the full grid on the board origin', () => {
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < SCENE_TILE_COUNT; i++) {
      const p = tileGridPosition(i);
      sx += p.x;
      sy += p.y;
    }
    expect(sx).toBeCloseTo(0);
    expect(sy).toBeCloseTo(0);
  });

  it('every tile (plus pitch margin) fits inside the board face', () => {
    for (let i = 0; i < SCENE_TILE_COUNT; i++) {
      const p = tileGridPosition(i);
      expect(Math.abs(p.x) + TILE_PITCH / 2).toBeLessThanOrEqual(BOARD_W / 2);
      expect(Math.abs(p.y) + TILE_PITCH / 2).toBeLessThanOrEqual(BOARD_H / 2);
    }
  });
});

/** The drawing tools fixed in the 2026-07-14 grill session. */
describe('drawing tools', () => {
  it('offers exactly six neon inks, all distinct, all valid hex', () => {
    expect(INK_PALETTE).toHaveLength(6);
    const hexes = INK_PALETTE.map((i) => i.hex);
    expect(new Set(hexes).size).toBe(hexes.length);
    for (const { name, hex } of INK_PALETTE) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it('the tile ground is a valid near-black hex', () => {
    expect(TILE_GROUND).toMatch(/^#[0-9a-f]{6}$/);
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(TILE_GROUND.slice(i, i + 2), 16));
    expect((r + g + b) / 3).toBeLessThan(40); // near-black, not just dark
  });

  it('offers three brush sizes, fine to broad', () => {
    expect(BRUSH_SIZES).toHaveLength(3);
    expect([...BRUSH_SIZES]).toEqual([...BRUSH_SIZES].slice().sort((a, b) => a - b));
    expect(new Set(BRUSH_SIZES).size).toBe(3);
  });

  it('undo runs twenty steps deep', () => {
    expect(UNDO_DEPTH).toBe(20);
  });
});
