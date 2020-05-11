import React from 'react';
import { render } from '@testing-library/react';

import HomePage from './HomePage';

describe('components/HomePage', () => {
  it('renders', () => {
    const { getByText } = render(<HomePage />);

    expect(getByText('Welcome!')).toBeTruthy();
  });
});
