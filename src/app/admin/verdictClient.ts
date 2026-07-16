import type { Verdict } from '@/lib/doodle-wall/tileService';

/**
 * The one place the counter's client components PATCH a verdict. Outcomes:
 * 'done' (persisted), 'stale' (the tile was already ruled on or is gone —
 * tile-level reasons from OUR route, never a bare status code, so a platform
 * 404 mid-deploy can't silently eat verdicts), 'error' (surface + retry).
 */
export type VerdictOutcome = 'done' | 'stale' | 'error';

export async function sendVerdict(id: string, verdict: Verdict): Promise<VerdictOutcome> {
  try {
    const res = await fetch(`/api/admin/tiles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verdict }),
    });
    if (res.ok) return 'done';
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    if (payload.error === 'not-found' || payload.error === 'invalid-transition') return 'stale';
    return 'error';
  } catch {
    return 'error';
  }
}
