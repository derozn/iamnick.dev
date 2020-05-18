import React from 'react';
import { render } from '@testing-library/react';

import Scene from './Scene';

describe('components/Scene', () => {
  it('renders canvas', () => {
    const { getByTestId } = render(<Scene />);

    expect(getByTestId('scene')).toBeTruthy();
  });
});
