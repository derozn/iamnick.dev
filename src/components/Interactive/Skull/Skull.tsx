import React from 'react';
import { useLoader } from 'react-three-fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import useStore from '#store';

const Skull = () => {
  const skullUrl = useStore((state) => state.skullUrl);
  const skullOBJ = useLoader(OBJLoader, skullUrl);

  return <primitive object={skullOBJ} />;
};

export default Skull;
