import { describe, expect, it } from 'vitest';

import { pyramidPositions, PYRAMID_ROWS, STACK_ANCHOR } from './ballTossConfig';

/** The bottle stack layout — a 3-2-1 pyramid, each row centred and lifted. */
describe('pyramidPositions', () => {
  it('produces one position per bottle (sum of the rows)', () => {
    const total = PYRAMID_ROWS.reduce((n, c) => n + c, 0);
    expect(pyramidPositions(0.3, 0.5)).toHaveLength(total);
    expect(total).toBe(6); // 3 + 2 + 1
  });

  it('centres each row around the stack anchor laterally', () => {
    const pos = pyramidPositions(0.3, 0.5);
    // front row is the first PYRAMID_ROWS[0] entries; their lateral offsets sum to 0.
    const front = pos.slice(0, PYRAMID_ROWS[0]);
    const lateralSum = front.reduce((n, p) => n + (p.x - STACK_ANCHOR.x), 0);
    expect(lateralSum).toBeCloseTo(0);
  });

  it('lifts each successive row by `rise`', () => {
    const rise = 0.5;
    const pos = pyramidPositions(0.3, rise);
    const frontY = pos[0].y;
    const topY = pos[pos.length - 1].y; // last bottle = top row
    expect(topY - frontY).toBeCloseTo((PYRAMID_ROWS.length - 1) * rise);
  });

  it('scales lateral spread with spacing', () => {
    const tight = pyramidPositions(0.2, 0.5);
    const wide = pyramidPositions(0.6, 0.5);
    const spread = (arr: ReturnType<typeof pyramidPositions>) =>
      Math.max(...arr.map((p) => p.x)) - Math.min(...arr.map((p) => p.x));
    expect(spread(wide)).toBeGreaterThan(spread(tight));
  });
});
