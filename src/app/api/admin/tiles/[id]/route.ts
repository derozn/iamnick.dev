import { z } from 'zod';

import { createTileService, type ModerateResult } from '@/lib/doodle-wall/tileService';
import { getAdminIdentity } from '@/lib/supabase/adminAuth';
import { getTileAdapters } from '@/lib/supabase/tileAdapters';

/**
 * PATCH /api/admin/tiles/:id — one verdict from the carny.
 * Thin adapter: allow-list guard → parse → tileService.moderate (which owns
 * transition legality). Body `{ verdict: 'approve' | 'reject' }`.
 *
 * Responses: 200 `{ id, status }`; errors as `{ error }` JSON — 401 signed
 * out, 403 not the carny, 400 bad body, 404 unknown tile, 409 illegal
 * transition, 503 pre-provisioning stub mode (nothing to moderate: the
 * queue lives in per-instance memory and no one can sign in).
 */
export const runtime = 'nodejs';

const BodySchema = z.object({
  verdict: z.enum(['approve', 'reject']),
});

const FAILURE_STATUS: Record<Extract<ModerateResult, { ok: false }>['reason'], number> = {
  'not-found': 404,
  'invalid-transition': 409,
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  // Same cross-site Origin rejection as POST /api/tiles: the session cookie
  // is ambient authority, so a state-changing route refuses foreign origins
  // outright rather than trusting SameSite defaults alone.
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return Response.json({ error: 'bad-origin' }, { status: 403 });
      }
    } catch {
      return Response.json({ error: 'bad-origin' }, { status: 403 });
    }
  }

  const identity = await getAdminIdentity();
  if (identity.kind === 'unconfigured') {
    return Response.json({ error: 'unconfigured' }, { status: 503 });
  }
  if (identity.kind === 'anonymous') {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (identity.kind === 'denied') {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid-request' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'invalid-request' }, { status: 400 });

  const { id } = await ctx.params;
  const service = createTileService(getTileAdapters());
  const result = await service.moderate({ id, verdict: parsed.data.verdict });

  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: FAILURE_STATUS[result.reason] });
  }
  return Response.json({ id: result.id, status: result.status });
}
