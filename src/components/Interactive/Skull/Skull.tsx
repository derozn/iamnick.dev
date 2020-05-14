import React from 'react';
import { useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three';

import useStore from '#store';

const Skull = () => {
  const { gltfUrl, textureUrl } = useStore((state) => state.skull);

  const skullTexture = useLoader(TextureLoader, textureUrl);
  const skullGLTF = useLoader(GLTFLoader, gltfUrl);

  return (
    <group>
      <mesh name="skull-head" {...skullGLTF.scene.children[3]}>
        <meshBasicMaterial attach="material" map={skullTexture} />
      </mesh>
      <mesh name="skull-jaw" {...skullGLTF.scene.children[2]}>
        <meshBasicMaterial attach="material" map={skullTexture} />
      </mesh>
    </group>
  );
};

export default Skull;
