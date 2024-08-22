'use client';

import { Canvas } from '@react-three/fiber';
import { World } from '../World';

export const Scene = () => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <color attach="background" args={['#252530']} />
      <fog attach="fog" args={['#272730', 16, 30]} />
      <ambientLight intensity={0.5} />
      <World />
    </Canvas>
  );
};
