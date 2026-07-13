import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Best-effort in-memory rate limiting for the fortune route, on the maintained
 * `rate-limiter-flexible` (RateLimiterMemory — no external store). Two tiers: a
 * per-IP sliding minute window, and a daily budget kill-switch that caps
 * worst-case model spend across ALL visitors. Serverless instances each keep
 * their own counters, so this under-counts across regions/cold starts —
 * acceptable at this scale. For real cross-instance limiting, swap
 * RateLimiterMemory for a RateLimiterRedis (the route runs on the Node runtime,
 * so a real Redis socket works); the route only calls checkRateLimit(), so the
 * swap stays here.
 */

/** Per-IP: max requests per minute. */
const PER_MINUTE = 10;
/** Daily kill-switch: max model calls per rolling day across all visitors. */
const PER_DAY = 200;
/** The single key the daily budget counts against. */
const DAY_KEY = 'global';

let perIp = new RateLimiterMemory({ points: PER_MINUTE, duration: 60 });
let daily = new RateLimiterMemory({ points: PER_DAY, duration: 86_400 });

export type RateLimitVerdict = 'ok' | 'rate-limited' | 'budget-exhausted';

export async function checkRateLimit(ip: string): Promise<RateLimitVerdict> {
  // Daily budget first (the hard stop) — checked without consuming, so a
  // rate-limited request below doesn't burn budget.
  const day = await daily.get(DAY_KEY);
  if (day && day.consumedPoints >= PER_DAY) return 'budget-exhausted';

  try {
    await perIp.consume(ip, 1);
  } catch {
    return 'rate-limited';
  }

  // Only successful model calls count against the daily budget.
  await daily.consume(DAY_KEY, 1);
  return 'ok';
}

/** Test hook: reset all counters between cases. */
export function resetRateLimit(): void {
  perIp = new RateLimiterMemory({ points: PER_MINUTE, duration: 60 });
  daily = new RateLimiterMemory({ points: PER_DAY, duration: 86_400 });
}
