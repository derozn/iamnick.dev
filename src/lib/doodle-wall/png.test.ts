import { describe, expect, it } from 'vitest';

import { makeNoisePng, makeSolidPng } from './fakes';
import { readPngDimensions } from './png';

describe('readPngDimensions', () => {
  it('reads the dimensions of a valid PNG', () => {
    expect(readPngDimensions(makeSolidPng(256, [255, 64, 129]))).toEqual({
      width: 256,
      height: 256,
    });
    expect(readPngDimensions(makeSolidPng(512, [0, 0, 0]))).toEqual({ width: 512, height: 512 });
  });

  it('reads noise PNGs the same as solid ones', () => {
    expect(readPngDimensions(makeNoisePng(256))).toEqual({ width: 256, height: 256 });
  });

  it('rejects bytes without the PNG signature', () => {
    expect(readPngDimensions(new TextEncoder().encode('<svg xmlns="…"></svg> padding padding'))) //
      .toBeNull();
    const almost = makeSolidPng(256, [1, 2, 3]);
    almost[0] = 0x88;
    expect(readPngDimensions(almost)).toBeNull();
  });

  it('rejects truncated buffers', () => {
    expect(readPngDimensions(new Uint8Array(0))).toBeNull();
    expect(readPngDimensions(makeSolidPng(256, [1, 2, 3]).slice(0, 20))).toBeNull();
  });

  it('rejects a PNG whose first chunk is not a well-formed IHDR', () => {
    const png = makeSolidPng(256, [1, 2, 3]);
    const badLength = png.slice();
    badLength[11] = 14; // IHDR length must be exactly 13
    expect(readPngDimensions(badLength)).toBeNull();
    const badType = png.slice();
    badType[12] = 0x4a; // "JHDR"
    expect(readPngDimensions(badType)).toBeNull();
  });

  it('rejects zero-sized dimensions', () => {
    const png = makeSolidPng(256, [1, 2, 3]);
    png[16] = png[17] = png[18] = png[19] = 0; // width = 0
    expect(readPngDimensions(png)).toBeNull();
  });

  it('is offset-safe when handed a subarray view', () => {
    const png = makeSolidPng(256, [9, 9, 9]);
    const padded = new Uint8Array(png.length + 8);
    padded.set(png, 8);
    expect(readPngDimensions(padded.subarray(8))).toEqual({ width: 256, height: 256 });
  });
});
