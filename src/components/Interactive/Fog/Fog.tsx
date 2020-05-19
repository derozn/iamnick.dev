import React, { useState, useRef, useEffect } from 'react';
import { useLoader, useFrame, extend } from 'react-three-fiber';
import { TextureLoader } from 'three';

import useStore from '#store';

import { CloudsMaterial } from './materials/clouds';
import { Clouds } from './objects/clouds';

extend({ CloudsMaterial, Clouds });

const Fog = () => {
  const clouds = useRef<Clouds>(null);
  const [time, setTime] = useState(0.0);
  const { textureUrl } = useStore((state) => state.fog);
  const cloudTexture = useLoader(TextureLoader, textureUrl);

  useEffect(() => {
    if (clouds.current) clouds.current.create();
  }, []);

  useFrame((_, delay) => {
    setTime(time + delay);
  });

  return (
    <mesh name="fog">
      <clouds args={[20]} ref={clouds} attach="geometry" />
      <cloudsMaterial
        attach="material"
        cloudTexture={cloudTexture}
        time={time}
        extensions-derivatives
      />
    </mesh>
  );
};

export default Fog;
