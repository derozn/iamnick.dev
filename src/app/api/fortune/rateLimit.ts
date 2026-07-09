/**
 * Best-effort in-memory rate limiting for the fortune route (Nick's choice:
 * start without a second vendor; the daily budget below keeps worst-case spend
 * at pocket change even if limits reset). Edge isolates each keep their own
 * counters, so this under-counts across regions/cold starts — acceptable at
 * this scale. Swap for Upstash Ratelimit (sliding window, shared Redis) if the
 * site ever draws real traffic; the route only calls checkRateLimit(), so the
 * swap is contained to this file.
 */

/** Sliding window: max requests per IP per minute. */
const PER_MINUTE = 10;
const WINDOW_MS = 60_000;
/** Daily kill-switch: max model calls per UTC day across ALL visitors. */
const PER_DAY = 200;
/** Bound the map so a botnet can't grow it unbounded. */
const MAX_TRACKED_IPS = 10_000;

const hits = new Map<string, number[]>();
let dayKey = '';
let dayCount = 0;

export type RateLimitVerdict = 'ok' | 'rate-limited' | 'budget-exhausted';

export function checkRateLimit(ip: string, now: number = Date.now()): RateLimitVerdict {
  // Daily budget first — the hard stop.
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== dayKey) {
    dayKey = today;
    dayCount = 0;
  }
  if (dayCount >= PER_DAY) return 'budget-exhausted';

  // Per-IP sliding minute window.
  const cutoff = now - WINDOW_MS;
  const recent = (hits.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= PER_MINUTE) {
    hits.set(ip, recent);
    return 'rate-limited';
  }

  if (!hits.has(ip) && hits.size >= MAX_TRACKED_IPS) hits.clear();
  hits.set(ip, [...recent, now]);
  dayCount += 1;
  return 'ok';
}

/** Test hook: reset all counters between cases. */
export function resetRateLimit(): void {
  hits.clear();
  dayKey = '';
  dayCount = 0;
}
