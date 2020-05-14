/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */

// Seems to be an error when using declare/namespace and unused vars when they're being used
import { ReactThreeFiber } from 'react-three-fiber';

import { SkullMaterial } from './skull';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      skullMaterial: ReactThreeFiber.MaterialNode<SkullMaterial, []>;
    }
  }
}
