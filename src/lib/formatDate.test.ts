import { describe, expect, it } from 'vitest';

import { formatYearMonth } from './formatDate';

describe('lib/formatDate', () => {
  it("formats 'YYYY-MM' as 'Mon YYYY'", () => {
    expect(formatYearMonth('2025-11')).toBe('Nov 2025');
    expect(formatYearMonth('2020-06')).toBe('Jun 2020');
    // en-GB abbreviates September as 'Sept'.
    expect(formatYearMonth('2014-09')).toBe('Sept 2014');
  });

  it("returns 'Present' for a null end date", () => {
    expect(formatYearMonth(null)).toBe('Present');
  });
});
