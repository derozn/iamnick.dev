import { render, act } from '@testing-library/react';

import { mockIntersection } from '@/test/helpers/IntersectionObserver';

import useOnScreen from './useOnScreen';

const UseOnScreenComponent = ({ rootMargin }: { rootMargin?: string }) => {
  const [ref, isIntersecting] = useOnScreen<HTMLDivElement>(rootMargin);

  return (
    <div ref={ref} data-testid="hook-component">
      {isIntersecting.toString()}
    </div>
  );
};

describe('components/useOnScreen', () => {
  it('returns false when element is not in view', () => {
    const { getByText } = render(<UseOnScreenComponent />);

    expect(getByText('false')).toBeTruthy();
  });

  it('returns true when element is in view', () => {
    const { getByText, getByTestId } = render(<UseOnScreenComponent />);

    act(() => {
      mockIntersection(getByTestId('hook-component'), true);
    });

    expect(getByText('true')).toBeTruthy();
  });
});
