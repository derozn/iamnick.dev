import React from 'react';
import { render } from '@testing-library/react';

import BlockReveal from './BlockReveal';

describe('components/BlockReveal', () => {
  it('renders children', () => {
    const { getByText } = render(<BlockReveal backgroundColor="#fff">hello world!</BlockReveal>);

    expect(getByText('hello world!')).toBeTruthy();
  });

  it('renders with background css style set to passed in backgroundColor', () => {
    const { container } = render(<BlockReveal backgroundColor="#fff">hello world!</BlockReveal>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with additional delay factor on reveal animation', () => {
    const { container } = render(
      <BlockReveal backgroundColor="#fff" delay={0.5}>
        hello world!
      </BlockReveal>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
