import { Buffer } from 'node:buffer';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeNoisePng, makeSolidPng, type InMemoryTileRepository } from '@/lib/doodle-wall/fakes';
import { hashSubmitter } from '@/lib/doodle-wall/submitterHash';
import {
  DEV_SUBMITTER_HASH_SECRET,
  getTileAdapters,
  resetTileAdapters,
} from '@/lib/supabase/tileAdapters';

import { resetBurstLimit } from './rateLimit';
import { POST } from './route';

/**
 * Route-handler tests, keyless (stub mode) and offline: the factory wires
 * the in-memory fakes because no SUPABASE_* env is set.
 */

const VALID_IMAGE = Buffer.from(makeSolidPng(256, [255, 64, 129])).toString('base64');

const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request('https://iamnick.dev/api/tiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: 'iamnick.dev',
        'x-forwarded-for': '203.0.113.7',
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

/** The stub-mode fake repository behind the factory, for direct inspection. */
const fakeRepository = () => getTileAdapters().repository as InMemoryTileRepository;

beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_ANON_KEY', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  vi.stubEnv('SUBMITTER_HASH_SECRET', '');
  resetTileAdapters();
  resetBurstLimit();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/tiles — validation', () => {
  it('rejects malformed JSON with 400', async () => {
    expect((await post('{nope')).status).toBe(400);
  });

  it('rejects a missing, empty, or non-base64 image with 400', async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ image: '' })).status).toBe(400);
    expect((await post({ image: 'not base64 !!!' })).status).toBe(400);
    expect((await post({ image: 42 })).status).toBe(400);
  });

  it('rejects oversized raw bodies with 413 before parsing', async () => {
    const res = await post(`{"image":"${'A'.repeat(210_000)}"}`);
    expect(res.status).toBe(413);
  });

  it('rejects cross-origin and malformed-origin requests with 403', async () => {
    expect((await post({ image: VALID_IMAGE }, { origin: 'https://evil.example' })).status) //
      .toBe(403);
    expect((await post({ image: VALID_IMAGE }, { origin: 'not a url' })).status).toBe(403);
  });

  it('rejects base64 that is not a 256×256 PNG with 400', async () => {
    const wrongSize = Buffer.from(makeSolidPng(512, [0, 0, 0])).toString('base64');
    const res = await post({ image: wrongSize });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid-image' });
  });

  it('rejects a valid PNG over the byte cap with 413', async () => {
    const oversized = Buffer.from(makeNoisePng(256)).toString('base64');
    const res = await post({ image: oversized });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'too-large' });
  });
});

describe('POST /api/tiles — submission', () => {
  it('accepts a valid tile with 201 and a pending-only contract', async () => {
    const res = await post({ image: VALID_IMAGE }, { origin: 'https://iamnick.dev' });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; status: string; createdAt: string };
    expect(body.status).toBe('pending');
    expect(body.id).toBeTruthy();
    expect(Date.parse(body.createdAt)).not.toBeNaN();
  });

  it('never lands a smuggled status — the tile stays pending', async () => {
    const res = await post({ image: VALID_IMAGE, status: 'approved' });
    expect(res.status).toBe(201);
    const stored = fakeRepository()
      .all()
      .find((tile) => tile.submitterHash !== 'seed');
    expect(stored?.status).toBe('pending');
    // And it never surfaces on the wall.
    const wall = await fakeRepository().recentApproved(48);
    expect(wall.some((tile) => tile.id === stored?.id)).toBe(false);
  });

  it('stores the submitter as an HMAC of the IP, never the raw IP', async () => {
    await post({ image: VALID_IMAGE });
    const stored = fakeRepository()
      .all()
      .find((tile) => tile.submitterHash !== 'seed');
    expect(stored?.submitterHash).toBe(hashSubmitter('203.0.113.7', DEV_SUBMITTER_HASH_SECRET));
  });
});

describe('POST /api/tiles — rate limiting', () => {
  it('429s the 3rd submission inside a minute from one IP (burst guard)', async () => {
    expect((await post({ image: VALID_IMAGE })).status).toBe(201);
    expect((await post({ image: VALID_IMAGE })).status).toBe(201);
    const res = await post({ image: VALID_IMAGE });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate-limited' });
  });

  it('429s when the durable daily cap is already spent for the hash', async () => {
    const hash = hashSubmitter('203.0.113.7', DEV_SUBMITTER_HASH_SECRET);
    const repository = fakeRepository();
    for (let i = 0; i < 10; i++) {
      await repository.insert({
        id: `capped-${i}`,
        imagePath: `capped-${i}.png`,
        imageUrl: 'data:image/png;base64,',
        status: 'pending',
        submitterHash: hash,
        createdAt: new Date().toISOString(),
      });
    }
    const res = await post({ image: VALID_IMAGE });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate-limited' });
  });
});
