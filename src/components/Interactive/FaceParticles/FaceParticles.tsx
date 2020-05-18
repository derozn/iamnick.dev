import React, { useRef, useState } from 'react';
import { useLoader, useFrame } from 'react-three-fiber';
import { TextureLoader } from 'three';

import useStore from '#store';

import './materials/face';
import { useFaceGeometry } from './hooks/useFaceGeometry';

const FaceParticles = () => {
  const [time, setTime] = useState(0);
  const instancedBufferGeomRef = useRef<any>();
  const { textureUrl } = useStore((state) => state.face);
  const faceTexture = useLoader(TextureLoader, textureUrl);

  useFaceGeometry({ geometry: instancedBufferGeomRef, texture: faceTexture });

  useFrame((_, delta) => {
    setTime(time + delta);
  });

  return (
    <group name="particle-hit-group">
      <mesh name="particles">
        <instancedBufferGeometry ref={instancedBufferGeomRef} attach="geometry" />
        <faceMaterial
          attach="material"
          time={time}
          faceTexture={faceTexture}
          extensions-derivatives
        />
      </mesh>
    </group>
  );
};

export default FaceParticles;
