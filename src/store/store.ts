import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { Vector3, Color } from 'three';

import { State } from './types';

const store = (): State => {
  return {
    zoom: 1,
    position: new Vector3(0, 0, 300),
    background: {
      color: new Color('#070810'),
    },
    fog: {
      textureUrl: '/textures/fog.png',
    },
    face: {
      textureUrl: '/textures/nick.png',
    },
  };
};

const withMiddleWare = devtools(store);

const [useStore] = create<State>(withMiddleWare);

export default useStore;
