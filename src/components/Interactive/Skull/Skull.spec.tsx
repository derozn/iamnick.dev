import React, { Suspense } from 'react';
import { render } from '@testing-library/react';

import Skull from './Skull';

jest.mock('three/examples/jsm/loaders/OBJLoader');

describe('components/Skull', () => {
  it('renders', () => {
    render(
      <Suspense fallback={null}>
        <Skull />
      </Suspense>,
    );
  });
});
