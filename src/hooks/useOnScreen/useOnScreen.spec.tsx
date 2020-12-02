import React, { FunctionComponent } from 'react';
import { render, act } from '@testing-library/react';

import { mockIntersection } from 'test/helpers/IntersectionObserver';

import useOnScreen from './useOnScreen';

type Props = {
  rootMargin?: string;
  persist?: boolean;
};

const UseOnScreenComponent: FunctionComponent<Props> = (props) => {
  const [ref, isIntersecting] = useOnScreen<HTMLDivElement>(props);

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

  describe('When persist is true', () => {
    it('returns true when element was in view but is now not in view', () => {
      const { getByText, getByTestId } = render(<UseOnScreenComponent persist />);

      act(() => {
        mockIntersection(getByTestId('hook-component'), true);
      });

      expect(getByText('true')).toBeTruthy();

      act(() => {
        mockIntersection(getByTestId('hook-component'), false);
      });

      expect(getByText('true')).toBeTruthy();
    });
  });
});
