import React, { useState, useRef } from 'react';
import { useLoader, useFrame } from 'react-three-fiber';
import { TextureLoader, InstancedBufferGeometry } from 'three';

import useStore from '#store';

import './materials/fog';
import { useCreateFogGeometry } from './hooks/useCreateFogGeometry';

const Fog = () => {
  const instancedBufferGeomRef = useRef<InstancedBufferGeometry>();
  const [time, setTime] = useState(0.0);
  const { textureUrl } = useStore((state) => state.fog);
  const backgroundTexture = useLoader(TextureLoader, textureUrl);

  useCreateFogGeometry({ geometry: instancedBufferGeomRef.current, amount: 20 });

  useFrame((_, delay) => {
    setTime(time + delay);
  });

  return (
    <mesh name="fog">
      <instancedBufferGeometry ref={instancedBufferGeomRef} attach="geometry" />
      <fogMaterial
        attach="material"
        fogTexture={backgroundTexture}
        time={time}
        extensions-derivatives
      />
    </mesh>
  );
};

export default Fog;
