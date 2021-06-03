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
  };
};

const withMiddleWare = devtools(store);

const useStore = create<State>(withMiddleWare);

export default useStore;
