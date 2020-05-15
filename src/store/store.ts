import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { Vector3, Color } from 'three';

import { State } from './types';

const store = (): State => {
  return {
    zoom: 75,
    position: new Vector3(0, 0, 500),
    skull: {
      gltfUrl: '/models/skullhead.gltf',
      textureUrl: '/textures/noise-bw.png',
    },
    backgroundColor: new Color('#070810'),
  };
};

const withMiddleWare = devtools(store);

const [useStore] = create<State>(withMiddleWare);

export default useStore;
