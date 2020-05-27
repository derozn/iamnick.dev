import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame, extend } from 'react-three-fiber';
import { TextureLoader } from 'three';

import useStore from '#store';

import { CloudsMaterial } from './materials/clouds';
import { Clouds } from './objects/clouds';

extend({ CloudsMaterial, Clouds });

const Fog = () => {
  const clouds = useRef<Clouds>(null);
  const cloudsMaterialRef = useRef<CloudsMaterial>(null);
  const { textureUrl } = useStore((state) => state.fog);
  const cloudTexture = useLoader(TextureLoader, textureUrl);

  useEffect(() => {
    if (clouds.current) clouds.current.create();
  }, []);

  useFrame((_, delta) => {
    if (cloudsMaterialRef.current) {
      cloudsMaterialRef.current.update(delta);
    }
  });

  return (
    <group>
      <mesh name="fog" position={[0, 0, -700]}>
        <clouds args={[20]} ref={clouds} attach="geometry" />
        <cloudsMaterial
          ref={cloudsMaterialRef}
          attach="material"
          cloudTexture={cloudTexture}
          extensions-derivatives
        />
      </mesh>
    </group>
  );
};

export default Fog;
