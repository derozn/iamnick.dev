import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { setupMatchMedia } from '@test/helpers/matchMedia';

import useMedia from './useMedia';

describe('hooks/useMedia', () => {
  it('returns true when the viewport is wider than the given min-width', () => {
    setupMatchMedia({ width: 769 });

    const { result } = renderHook(() => useMedia('(min-width: 768px)', false));

    expect(result.current).toBe(true);
  });

  it('returns false when the viewport is narrower than the given min-width', () => {
    setupMatchMedia({ width: 400 });

    const { result } = renderHook(() => useMedia('(min-width: 768px)', false));

    expect(result.current).toBe(false);
  });
});
