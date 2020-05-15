import React from 'react';
import { useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';

import useStore from '#store';

import './materials/skull';

const Skull = () => {
  const { gltfUrl, textureUrl } = useStore((state) => state.skull);

  const skullTexture = useLoader(TextureLoader, textureUrl);
  const skullGLTF = useLoader(GLTFLoader, gltfUrl);

  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      <mesh name="skull-head" {...skullGLTF.scene.children[3]}>
        <skullMaterial attach="material" noiseTex={skullTexture} extensions-derivatives />
      </mesh>
      <mesh name="skull-jaw" {...skullGLTF.scene.children[2]}>
        <skullMaterial attach="material" noiseTex={skullTexture} extensions-derivatives />
      </mesh>
    </group>
  );
};

export default Skull;
