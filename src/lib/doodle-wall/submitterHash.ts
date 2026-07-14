import { createHmac } from 'node:crypto';

/**
 * Stable pseudonym for a submitting IP: HMAC-SHA256(ip) under a server-side
 * secret, hex-encoded. Stable per IP so the daily cap and abuse tracing
 * work, but no raw IP is ever at rest — and without the secret the hash
 * cannot be reversed to an address by dictionary walk.
 */
export function hashSubmitter(ip: string, secret: string): string {
  return createHmac('sha256', secret).update(ip).digest('hex');
}
