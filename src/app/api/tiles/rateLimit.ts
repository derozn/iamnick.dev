import { RateLimiterMemory } from 'rate-limiter-flexible';

import { SUBMIT_BURST_PER_MINUTE } from '@/lib/doodle-wall/constants';

/**
 * Best-effort in-memory burst guard for tile submissions (mirrors
 * api/fortune/rateLimit.ts): per-IP, SUBMIT_BURST_PER_MINUTE points per
 * sliding minute. Serverless instances each keep their own counters, so
 * this under-counts across regions/cold starts — accepted for the burst
 * guard, because the 10-per-day cap is enforced durably by counting rows
 * through the repository port in tileService instead. For real
 * cross-instance limiting, swap RateLimiterMemory for RateLimiterRedis;
 * the route only calls checkBurstLimit(), so the swap stays here.
 */

let perIp = new RateLimiterMemory({ points: SUBMIT_BURST_PER_MINUTE, duration: 60 });

export type BurstVerdict = 'ok' | 'rate-limited';

export async function checkBurstLimit(ip: string): Promise<BurstVerdict> {
  try {
    await perIp.consume(ip, 1);
    return 'ok';
  } catch {
    return 'rate-limited';
  }
}

/** Test hook: reset the counters between cases. */
export function resetBurstLimit(): void {
  perIp = new RateLimiterMemory({ points: SUBMIT_BURST_PER_MINUTE, duration: 60 });
}
