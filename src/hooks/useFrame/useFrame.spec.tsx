import { renderHook } from '@testing-library/react-hooks';

import useFrame from './useFrame';

describe('hooks/useFrame', () => {
  it('invokes callback every frame', () => {
    const callback = jest.fn();
    renderHook(() => useFrame(callback));

    expect(callback).toHaveBeenCalled();
  });

  it('invokes cancelAnimationFrame when unmounted', () => {
    const callback = jest.fn();
    const spiedCancelAnimFrame = jest.spyOn(window, 'cancelAnimationFrame');

    const { unmount } = renderHook(() => useFrame(callback));

    unmount();

    expect(spiedCancelAnimFrame).toHaveBeenCalled();
  });

  it('does not invoke same callback more than once per frame', () => {
    const callback = jest.fn();
    renderHook(() => useFrame(callback));
    renderHook(() => useFrame(callback));

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
