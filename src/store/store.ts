import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { State } from './types';

const useStore = create<State>()(
  devtools(() => ({
    fog: {
      textureUrl: '/textures/fog.png',
    },
    face: {
      textureUrl: '/textures/nick.png',
    },
  })),
);

export default useStore;
