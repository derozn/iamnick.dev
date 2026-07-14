import { Buffer } from 'node:buffer';

import { z } from 'zod';

import { hashSubmitter } from '@/lib/doodle-wall/submitterHash';
import { createTileService, type SubmitTileResult } from '@/lib/doodle-wall/tileService';
import { getTileAdapters } from '@/lib/supabase/tileAdapters';

import { checkBurstLimit } from './rateLimit';

/**
 * POST /api/tiles — submit one tile to the doodle wall's pre-moderation
 * queue (ADR-0001). Thin HTTP adapter over tileService: parse → burst
 * guard → service; every acceptance rule (PNG header, exact 256×256,
 * 128 KB cap, forced-pending status, durable daily cap) lives in the
 * service, not here.
 *
 * Body: JSON `{ image: <base64 PNG, no data: prefix> }`.
 * Responses: 201 `{ id, status: 'pending', createdAt }`; errors are
 * `{ error }` with 400 invalid, 413 too large, 429 rate-limited (burst or
 * daily cap), 403 bad origin.
 *
 * Node runtime, as fortune: rate-limiter-flexible and the (dormant)
 * Supabase adapter want a full Node environment.
 */
export const runtime = 'nodejs';

/**
 * Raw-body ceiling, checked before JSON.parse: base64 of the 128 KB tile
 * cap is ~175 KB, plus JSON envelope headroom. Anything larger cannot be a
 * legal submission, so it is refused before any parsing work.
 */
const MAX_BODY_BYTES = 204_800;

// Unknown keys (a smuggled `status`, say) are stripped by default — and the
// service could not accept one anyway.
const BodySchema = z.object({
  image: z.base64().min(1),
});

const FAILURE_STATUS: Record<Extract<SubmitTileResult, { ok: false }>['reason'], number> = {
  'invalid-image': 400,
  'too-large': 413,
  'daily-cap': 429,
};

export async function POST(req: Request): Promise<Response> {
  // Origin check: browser requests carry Origin on cross-site POSTs — reject
  // anything not from this site. (Requests without Origin, e.g. curl, are
  // bounded by the rate limits below.)
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    // A malformed Origin must read as forbidden, not crash the handler.
    try {
      if (new URL(origin).host !== host) {
        return Response.json({ error: 'bad-origin' }, { status: 403 });
      }
    } catch {
      return Response.json({ error: 'bad-origin' }, { status: 403 });
    }
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return Response.json({ error: 'too-large' }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: 'invalid-request' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'invalid-request' }, { status: 400 });

  // Burst guard before any decoding or storage work (first x-forwarded-for
  // hop, as fortune does).
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if ((await checkBurstLimit(ip)) === 'rate-limited') {
    return Response.json({ error: 'rate-limited' }, { status: 429 });
  }

  const adapters = getTileAdapters();
  const service = createTileService(adapters);
  const result = await service.submitTile({
    imageBytes: new Uint8Array(Buffer.from(parsed.data.image, 'base64')),
    submitterHash: hashSubmitter(ip, adapters.submitterHashSecret),
  });

  if (!result.ok) {
    const error = result.reason === 'daily-cap' ? 'rate-limited' : result.reason;
    return Response.json({ error }, { status: FAILURE_STATUS[result.reason] });
  }
  const { id, status, createdAt } = result.tile;
  return Response.json({ id, status, createdAt }, { status: 201 });
}
