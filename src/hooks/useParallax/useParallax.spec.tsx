import { renderHook } from '@testing-library/react-hooks';

import useParallax from './useParallax';

xdescribe('hooks/useParallax', () => {
  it('works', () => {
    const { result } = renderHook(() => useParallax());

    expect(result.current).toBe(true);
  });
});
