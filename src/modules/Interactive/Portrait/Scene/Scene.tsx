'use client';

import { Canvas } from '@react-three/fiber';
import { FaceParticles } from '../FaceParticles';
import { Suspense } from 'react';

export const PortraitScene = () => {
  return (
    <Canvas dpr={1} camera={{ zoom: 1, position: [0, 0, 300], far: 50000 }}>
      <Suspense fallback={null}>
        <FaceParticles />
      </Suspense>
    </Canvas>
  );
};
