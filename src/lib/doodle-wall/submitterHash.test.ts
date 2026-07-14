import { describe, expect, it } from 'vitest';

import { hashSubmitter } from './submitterHash';

describe('hashSubmitter', () => {
  it('is stable for the same IP and secret', () => {
    expect(hashSubmitter('203.0.113.7', 's3cret')).toBe(hashSubmitter('203.0.113.7', 's3cret'));
  });

  it('produces lowercase hex of HMAC-SHA256 length', () => {
    expect(hashSubmitter('203.0.113.7', 's3cret')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs across IPs and across secrets', () => {
    const hash = hashSubmitter('203.0.113.7', 's3cret');
    expect(hashSubmitter('203.0.113.8', 's3cret')).not.toBe(hash);
    expect(hashSubmitter('203.0.113.7', 'other')).not.toBe(hash);
  });

  it('never contains the raw IP', () => {
    expect(hashSubmitter('203.0.113.7', 's3cret')).not.toContain('203.0.113.7');
  });
});
