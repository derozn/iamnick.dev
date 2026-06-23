 

// Seems to be an error when using declare/namespace and unused vars when they're being used
import { ThreeElement } from '@react-three/fiber';

import { Particles } from './particles';

declare module '@react-three/fiber' {
  interface ThreeElements {
    particles: ThreeElement<typeof Particles>;
  }
}
