import { Buffer } from 'node:buffer';
import { timingSafeEqual } from 'node:crypto';

import { getTileAdapters } from '@/lib/supabase/tileAdapters';

/**
 * GET /api/keepalive — the daily cron's touch (vercel.json) so the
 * free-tier Supabase project registers activity and is never paused for
 * inactivity. One bounded read through the repository port; in stub mode
 * it touches the fakes and reports so.
 *
 * When CRON_SECRET is set, callers must present it (Vercel sends
 * `Authorization: Bearer <CRON_SECRET>` automatically); without the env the
 * route is open — it reads one approved tile, the same data /api/wall
 * already serves the world.
 */
export const runtime = 'nodejs';

export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret && !bearerMatches(req.headers.get('authorization'), secret)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const adapters = getTileAdapters();
  await adapters.repository.recentApproved(1);
  return Response.json({ ok: true, mode: adapters.live ? 'live' : 'stub' });
}

/** Constant-time bearer check — string !== leaks a per-character timing signal. */
function bearerMatches(header: string | null, secret: string): boolean {
  const presented = Buffer.from(header ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return presented.length === expected.length && timingSafeEqual(presented, expected);
}
