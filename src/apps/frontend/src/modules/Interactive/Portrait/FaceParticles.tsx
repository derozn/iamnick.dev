import { useRef, useEffect } from 'react';
import { useLoader, useFrame, extend } from '@react-three/fiber';
import { TextureLoader } from 'three';

import { ParticlesMaterial } from './materials/particles';
import { Particles } from './objects/particles';

extend({ ParticlesMaterial, Particles });

export const FaceParticles = () => {
  const particles = useRef<Particles>(null);
  const particlesMaterialRef = useRef<ParticlesMaterial>(null);
  const particleTexture = useLoader(TextureLoader, '/textures/nick.png');

  useEffect(() => {
    if (particles.current !== null) particles.current.create();
  }, []);

  useFrame((_, delta) => {
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.update(delta);
    }
  });

  return (
    <group name="particle-hit-group">
      <mesh name="particles" position={[75, 0, 0]}>
        <particles args={[particleTexture]} attach="geometry" ref={particles} />
        <particlesMaterial
          ref={particlesMaterialRef}
          attach="material"
          particleTexture={particleTexture}
          extensions-derivatives
        />
      </mesh>
    </group>
  );
};

export default FaceParticles;
