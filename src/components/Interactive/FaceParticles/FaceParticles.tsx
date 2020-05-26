import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, extend } from 'react-three-fiber';
import { TextureLoader } from 'three';

import useStore from '#store';

import { ParticlesMaterial } from './materials/particles';
import { Particles } from './objects/particles';

extend({ ParticlesMaterial, Particles });

const FaceParticles = () => {
  const [time, setTime] = useState(0);
  const particles = useRef<Particles>(null);
  const { textureUrl } = useStore((state) => state.face);
  const particleTexture = useLoader(TextureLoader, textureUrl);

  useEffect(() => {
    if (particles.current !== null) particles.current.create();
  }, []);

  useFrame((_, delta) => {
    setTime(time + delta);
  });

  return (
    <group name="particle-hit-group">
      <mesh name="particles" position={[75, 0, 0]}>
        <particles args={[particleTexture]} attach="geometry" ref={particles} />
        <particlesMaterial
          attach="material"
          time={time}
          particleTexture={particleTexture}
          extensions-derivatives
        />
      </mesh>
    </group>
  );
};

export default FaceParticles;
