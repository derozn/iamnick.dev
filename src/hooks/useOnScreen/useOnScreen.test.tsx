import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  installIntersectionObserver,
  mockIntersection,
  resetIntersectionObserver,
} from '@test/helpers/IntersectionObserver';

import useOnScreen from './useOnScreen';

const UseOnScreenComponent = ({ rootMargin }: { rootMargin?: string }) => {
  const [ref, isIntersecting] = useOnScreen<HTMLDivElement>(rootMargin);

  return (
    <div ref={ref} data-testid="hook-component">
      {isIntersecting.toString()}
    </div>
  );
};

describe('hooks/useOnScreen', () => {
  beforeEach(() => {
    installIntersectionObserver();
  });

  afterEach(() => {
    resetIntersectionObserver();
  });

  it('returns false when the element is not in view', () => {
    const { getByText } = render(<UseOnScreenComponent />);

    expect(getByText('false')).toBeTruthy();
  });

  it('returns true when the element scrolls into view', () => {
    const { getByText, getByTestId } = render(<UseOnScreenComponent />);

    act(() => {
      mockIntersection(getByTestId('hook-component'), true);
    });

    expect(getByText('true')).toBeTruthy();
  });
});
