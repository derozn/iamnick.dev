'use client';

import { Canvas } from '@react-three/fiber';
import { World } from '../World';

export const HeroScene = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: false }}
      orthographic
      camera={{ position: [10, 10, 10], zoom: 10 }}
    >
      <color attach="background" args={['#252530']} />
      <fog attach="fog" args={['#272730', 16, 30]} />
      <ambientLight intensity={0.05} />
      <World />
    </Canvas>
  );
};
