/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, no-undef */

// Seems to be an error when using declare/namespace and unused vars when they're being used
import { ReactThreeFiber } from 'react-three-fiber';

import { Particles } from './particles';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      particles: ReactThreeFiber.BufferGeometryNode<Particles, typeof Particles>;
    }
  }
}
