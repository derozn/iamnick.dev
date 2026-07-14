import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { deflateSync } from 'node:zlib';

import { STORED_TILE_SIZE } from './constants';
import type { TileImageStore, TileRepository } from './ports';
import type { Tile } from './types';

/**
 * In-memory adapters for the doodle wall ports — what dev, CI, and a
 * keyless production run against (stub mode) until Nick provisions
 * Supabase. Also includes a tiny programmatic PNG builder so the seeded
 * wall serves real, renderable 256×256 PNGs as data URIs and the tests can
 * mint valid (and deliberately invalid) fixtures without binary files.
 */

// --- PNG builder -----------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

export type Rgb = readonly [number, number, number];

/** Build a valid truecolour PNG of `size`×`size`, one callback per pixel. */
export function makeTilePng(size: number, pixelAt: (x: number, y: number) => Rgb): Uint8Array {
  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, size); // width
  ihdrView.setUint32(4, size); // height
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  // compression, filter, interlace all 0

  // Raw scanlines: one filter byte (0 = none) then RGB triples.
  const raw = new Uint8Array(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 3);
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelAt(x, y);
      raw[row + 1 + x * 3] = r;
      raw[row + 2 + x * 3] = g;
      raw[row + 3 + x * 3] = b;
    }
  }

  const idat = pngChunk('IDAT', new Uint8Array(deflateSync(raw)));
  const chunks = [signature, pngChunk('IHDR', ihdr), idat, pngChunk('IEND', new Uint8Array(0))];
  const png = new Uint8Array(chunks.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of chunks) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
}

/** A single-colour PNG — compresses to a few hundred bytes. */
export function makeSolidPng(size: number, colour: Rgb): Uint8Array {
  return makeTilePng(size, () => colour);
}

/**
 * A valid PNG of pseudo-random pixels — incompressible, so at 256×256 it
 * lands well over TILE_MAX_BYTES. Deterministic (LCG), no I/O.
 */
export function makeNoisePng(size: number): Uint8Array {
  // xorshift32 — an LCG's low bits are periodic enough for deflate to crush.
  let state = 0x2f6e2b1;
  const next = () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state & 0xff;
  };
  return makeTilePng(size, () => [next(), next(), next()]);
}

function pngDataUri(bytes: Uint8Array): string {
  return `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`;
}

// --- Seed data --------------------------------------------------------------

/** Neon-ish carnival palette for the seeded stub wall. */
const SEED_PALETTE: readonly Rgb[] = [
  [255, 64, 129],
  [64, 196, 255],
  [255, 196, 0],
  [124, 77, 255],
  [0, 230, 118],
  [255, 110, 64],
  [24, 255, 255],
  [244, 143, 177],
];

const SEED_BASE_MS = Date.parse('2026-07-01T12:00:00.000Z');

/**
 * Deterministic approved tiles so GET /api/wall returns renderable stub
 * data before Supabase exists — the scene slice builds against this. Index
 * 23 is the newest.
 */
export function seedApprovedTiles(): Tile[] {
  return Array.from({ length: 24 }, (_, i) => {
    const index = String(i + 1).padStart(2, '0');
    const bytes = makeSolidPng(STORED_TILE_SIZE, SEED_PALETTE[i % SEED_PALETTE.length]);
    return {
      id: `seed-tile-${index}`,
      imagePath: `seed/seed-tile-${index}.png`,
      imageUrl: pngDataUri(bytes),
      status: 'approved' as const,
      submitterHash: 'seed',
      createdAt: new Date(SEED_BASE_MS + i * 60_000).toISOString(),
    };
  });
}

// --- Port fakes --------------------------------------------------------------

export class InMemoryTileRepository implements TileRepository {
  private tiles: Tile[];

  constructor(seed: Tile[] = []) {
    this.tiles = [...seed];
  }

  insert(tile: Tile): Promise<void> {
    this.tiles.push(tile);
    return Promise.resolve();
  }

  recentApproved(limit: number): Promise<Tile[]> {
    const approved = this.tiles
      .filter((tile) => tile.status === 'approved')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
    return Promise.resolve(approved);
  }

  countSubmittedSince(submitterHash: string, sinceIso: string): Promise<number> {
    const count = this.tiles.filter(
      (tile) => tile.submitterHash === submitterHash && tile.createdAt >= sinceIso,
    ).length;
    return Promise.resolve(count);
  }

  /** Test/stub inspection — deliberately not part of the port. */
  all(): readonly Tile[] {
    return this.tiles;
  }
}

export class InMemoryTileImageStore implements TileImageStore {
  private images = new Map<string, Uint8Array>();

  store(bytes: Uint8Array): Promise<{ path: string; url: string }> {
    const path = `${randomUUID()}.png`;
    this.images.set(path, bytes);
    // A data URI stands in for the Storage public URL — renderable anywhere.
    return Promise.resolve({ path, url: pngDataUri(bytes) });
  }

  remove(path: string): Promise<void> {
    this.images.delete(path);
    return Promise.resolve();
  }
}
