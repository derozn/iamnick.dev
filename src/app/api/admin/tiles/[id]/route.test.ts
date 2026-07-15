import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { seedApprovedTiles } from '@/lib/doodle-wall/fakes';
import type { AdminIdentity } from '@/lib/supabase/adminAuth';
import { getTileAdapters, resetTileAdapters } from '@/lib/supabase/tileAdapters';

import { PATCH } from './route';

/**
 * Route-handler tests, keyless (stub mode) and offline. The auth adapter is
 * mocked per-case — its own allow-list rule is unit-tested in
 * src/lib/supabase/adminAuth.test.ts; here it is an input.
 */

const identity = vi.hoisted(() => ({ current: { kind: 'moderator', email: 'nick@iamnick.dev' } }));

vi.mock('@/lib/supabase/adminAuth', () => ({
  getAdminIdentity: () => Promise.resolve(identity.current),
}));

const setIdentity = (value: AdminIdentity) => {
  identity.current = value as typeof identity.current;
};

const patchTile = async (id: string, body: unknown) => {
  const res = await PATCH(
    new Request(`http://localhost/api/admin/tiles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
  return { res, body: (await res.json()) as Record<string, string> };
};

const seedPending = async (id: string) => {
  await getTileAdapters().repository.insert({
    ...seedApprovedTiles()[0],
    id,
    status: 'pending',
  });
};

beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_ANON_KEY', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  resetTileAdapters();
  setIdentity({ kind: 'moderator', email: 'nick@iamnick.dev' });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('PATCH /api/admin/tiles/:id — the carny gate', () => {
  it('401s a signed-out caller before touching anything', async () => {
    setIdentity({ kind: 'anonymous' });
    const { res, body } = await patchTile('whatever', { verdict: 'approve' });
    expect(res.status).toBe(401);
    expect(body).toEqual({ error: 'unauthorized' });
  });

  it('403s a signed-in account that is not the carny', async () => {
    setIdentity({ kind: 'denied', email: 'mallory@example.com' });
    const { res, body } = await patchTile('whatever', { verdict: 'approve' });
    expect(res.status).toBe(403);
    expect(body).toEqual({ error: 'forbidden' });
  });

  it('503s in pre-provisioning stub mode', async () => {
    setIdentity({ kind: 'unconfigured' });
    const { res } = await patchTile('whatever', { verdict: 'approve' });
    expect(res.status).toBe(503);
  });
});

describe('PATCH /api/admin/tiles/:id — verdicts', () => {
  it('approves a pending tile', async () => {
    await seedPending('queued-1');
    const { res, body } = await patchTile('queued-1', { verdict: 'approve' });
    expect(res.status).toBe(200);
    expect(body).toEqual({ id: 'queued-1', status: 'approved' });
  });

  it('rejects a pending tile', async () => {
    await seedPending('queued-2');
    const { res, body } = await patchTile('queued-2', { verdict: 'reject' });
    expect(res.status).toBe(200);
    expect(body).toEqual({ id: 'queued-2', status: 'rejected' });
  });

  it('400s a body without a legal verdict', async () => {
    await seedPending('queued-3');
    for (const bad of [{ verdict: 'promote' }, {}, 'not-json{{']) {
      const { res, body } = await patchTile('queued-3', bad);
      expect(res.status).toBe(400);
      expect(body).toEqual({ error: 'invalid-request' });
    }
  });

  it('404s an unknown tile', async () => {
    const { res, body } = await patchTile('no-such-tile', { verdict: 'approve' });
    expect(res.status).toBe(404);
    expect(body).toEqual({ error: 'not-found' });
  });

  it('409s an illegal transition (re-approving an approved tile)', async () => {
    // The seeds are approved tiles — approving one again is illegal.
    const approvedId = seedApprovedTiles()[0].id;
    const { res, body } = await patchTile(approvedId, { verdict: 'approve' });
    expect(res.status).toBe(409);
    expect(body).toEqual({ error: 'invalid-transition' });
  });

  it('takes an approved tile down (reject) — and the wall stops serving it', async () => {
    const approvedId = seedApprovedTiles()[0].id;
    const { res } = await patchTile(approvedId, { verdict: 'reject' });
    expect(res.status).toBe(200);
    const wall = await getTileAdapters().repository.recentApproved(48);
    expect(wall.map((t) => t.id)).not.toContain(approvedId);
  });
});
