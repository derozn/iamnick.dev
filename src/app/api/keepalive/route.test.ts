import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetTileAdapters } from '@/lib/supabase/tileAdapters';

import { GET } from './route';

/** Keyless (stub mode) and offline, like the other route tests. */

const keepalive = (headers: Record<string, string> = {}) =>
  GET(new Request('http://localhost/api/keepalive', { headers }));

beforeEach(() => {
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_ANON_KEY', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  vi.stubEnv('CRON_SECRET', '');
  resetTileAdapters();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('GET /api/keepalive', () => {
  it('touches the repository and reports stub mode when keyless', async () => {
    const res = await keepalive();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, mode: 'stub' });
  });

  it('requires the bearer token when CRON_SECRET is set', async () => {
    vi.stubEnv('CRON_SECRET', 'shhh');
    expect((await keepalive()).status).toBe(401);
    expect((await keepalive({ authorization: 'Bearer wrong' })).status).toBe(401);
    expect((await keepalive({ authorization: 'Bearer shhh' })).status).toBe(200);
  });
});
