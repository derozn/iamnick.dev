import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeSampler } from './bulbGlowExtract';

/**
 * makeSampler reads an image's pixels once and returns a UV → colour lookup:
 * dark texels (r+g+b < 60) are "not a bulb" (null); lit ones return normalised
 * RGB. jsdom has no real canvas, so we stub getImageData with a known 2×2 grid.
 */
const PIXELS = new Uint8ClampedArray([
  // (0,0) lit red        (1,0) dark
  255, 0, 0, 255, 10, 10, 10, 255,
  // (0,1) dark           (1,1) lit white
  0, 0, 0, 255, 255, 255, 255, 255,
]);

function stubCanvas(pixels: Uint8ClampedArray, w = 2, h = 2) {
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag !== 'canvas') return document.createElement(tag);
    return {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: () => undefined,
        getImageData: () => ({ data: pixels, width: w, height: h }),
      }),
    } as unknown as HTMLCanvasElement;
  });
}

afterEach(() => vi.restoreAllMocks());

describe('makeSampler', () => {
  const image = { width: 2, height: 2 } as CanvasImageSource & { width: number; height: number };

  it('returns normalised RGB for a lit texel', () => {
    stubCanvas(PIXELS);
    const sample = makeSampler(image);
    expect(sample(0.25, 0.25)).toEqual([1, 0, 0]); // top-left lit red
    expect(sample(0.75, 0.75)).toEqual([1, 1, 1]); // bottom-right lit white
  });

  it('returns null for a dark texel', () => {
    stubCanvas(PIXELS);
    const sample = makeSampler(image);
    expect(sample(0.75, 0.25)).toBeNull(); // top-right dark
    expect(sample(0.25, 0.75)).toBeNull(); // bottom-left black
  });

  it('wraps UVs outside [0,1)', () => {
    stubCanvas(PIXELS);
    const sample = makeSampler(image);
    // u=1.25 wraps to 0.25 → the lit red texel again
    expect(sample(1.25, 0.25)).toEqual([1, 0, 0]);
    expect(sample(-0.75, 0.25)).toEqual([1, 0, 0]);
  });
});
