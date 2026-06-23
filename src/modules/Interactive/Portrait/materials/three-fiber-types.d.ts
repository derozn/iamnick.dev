 

// Seems to be an error when using declare/namespace and unused vars when they're being used
import { ThreeElement } from '@react-three/fiber';

import { ParticlesMaterial } from './particles';

declare module '@react-three/fiber' {
  interface ThreeElements {
    particlesMaterial: ThreeElement<typeof ParticlesMaterial>;
  }
}
