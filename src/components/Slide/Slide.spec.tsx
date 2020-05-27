import React from 'react';
import { render } from '@testing-library/react';

import Slide from './Slide';

describe('components/Slide', () => {
  it('renders children', () => {
    const { getByText } = render(<Slide backgroundColor="#fff">hello world!</Slide>);

    expect(getByText('hello world!')).toBeTruthy();
  });

  it('renders with background css style set to passed in backgroundColor', () => {
    const { container } = render(<Slide backgroundColor="#fff">hello world!</Slide>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with additional delay factor on slide animation', () => {
    const { container } = render(
      <Slide backgroundColor="#fff" delay={0.5}>
        hello world!
      </Slide>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
