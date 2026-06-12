import { renderHook } from '@testing-library/react-hooks';
import { createMatchMedia } from '@/test/helpers/createMatchMedia';

import useMedia from './useMedia';

describe('hooks/useMedia', () => {
  it('returns true when width is greater that the given min-width', () => {
    createMatchMedia({ width: 769 });

    const { result } = renderHook(() => useMedia('(min-width: 768px)', false));

    expect(result.current).toBe(true);
  });

  it('returns false when width is less than the given min-width', () => {
    createMatchMedia({ width: 400 });

    const { result } = renderHook(() => useMedia('(min-width: 768px)', false));

    expect(result.current).toBe(false);
  });
});
