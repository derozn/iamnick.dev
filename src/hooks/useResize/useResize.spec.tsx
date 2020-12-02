import { renderHook } from '@testing-library/react-hooks';

import useResize from './useResize';

describe('hooks/useResize', () => {
  it('works', () => {
    const { result } = renderHook(() => useResize());

    expect(result.current).toEqual({});
  });
});
