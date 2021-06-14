/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, no-undef */

// Seems to be an error when using declare/namespace and unused vars when they're being used
import { ReactThreeFiber } from '@react-three/fiber';

import { Clouds } from './clouds';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      clouds: ReactThreeFiber.BufferGeometryNode<Clouds, typeof Clouds>;
    }
  }
}
