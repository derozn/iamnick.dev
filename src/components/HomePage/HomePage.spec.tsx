import React from 'react';
import { render } from '@testing-library/react';

import HomePage from './HomePage';

describe('components/HomePage', () => {
  it('render <Scene /> canvas', () => {
    const { getByTestId } = render(<HomePage />);

    expect(getByTestId('scene')).toBeTruthy();
  });
});
