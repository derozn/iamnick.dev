import { renderHook } from '@testing-library/react-hooks';

import useSmoothScroll from './useSmoothScroll';

describe('hooks/useSmoothScroll', () => {
  it('works', () => {
    const { result } = renderHook(() => useSmoothScroll());

    expect(result.current).toEqual({
      anchorRef: {
        current: null,
      },
      scrollRef: {
        current: null,
      },
    });
  });
});
