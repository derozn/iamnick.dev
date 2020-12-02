import create from 'zustand';
import { devtools } from 'zustand/middleware';

import { State } from './types';

const store = (): State => {
  return {
    fog: {
      textureUrl: '/textures/fog.png',
    },
    face: {
      textureUrl: '/textures/nick.png',
    },
    work: {
      textureUrls: [
        '/textures/gousto.png',
        '/textures/lyvly.png',
        '/textures/yoti.png',
        '/textures/arcadia.png',
        '/textures/vitamin.png',
      ],
    },
  };
};

const withMiddleWare = devtools(store);

const [useStore] = create<State>(withMiddleWare);

export default useStore;
