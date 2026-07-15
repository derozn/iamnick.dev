import { describe, expect, it } from 'vitest';

import { isModeratorEmail, MODERATOR_EMAILS } from './adminAuth';

describe('isModeratorEmail — the carny allow-list', () => {
  it('admits every allow-listed email, case- and whitespace-insensitively', () => {
    for (const email of MODERATOR_EMAILS) {
      expect(isModeratorEmail(email)).toBe(true);
      expect(isModeratorEmail(email.toUpperCase())).toBe(true);
      expect(isModeratorEmail(`  ${email} `)).toBe(true);
    }
  });

  it('denies everyone else — including lookalikes', () => {
    expect(isModeratorEmail('mallory@iamnick.dev')).toBe(false);
    expect(isModeratorEmail('nick@iamnick.dev.evil.example')).toBe(false);
    expect(isModeratorEmail('nick+admin@iamnick.dev')).toBe(false);
    expect(isModeratorEmail('')).toBe(false);
  });

  it('is a hard allow-list of exactly one account (ADR-0001)', () => {
    expect(MODERATOR_EMAILS).toHaveLength(1);
  });
});
