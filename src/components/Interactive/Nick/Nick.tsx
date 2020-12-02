import React from 'react';
import { useTheme } from 'styled-components';

import Fog from '#components/Interactive/Fog';
import FaceParticles from '#components/Interactive/FaceParticles';
import Effects from '#components/Interactive/Effects';
import Scene from '#components/Interactive/Scene';
import useStore from '#store';

const Nick = () => {
  const theme = useTheme();
  const { textureUrl } = useStore((state) => state.face);

  return (
    <Scene>
      <Fog />
      <FaceParticles textureUrl={textureUrl} position={[75, 0, 0]} />
      <Effects backgroundColor={theme.palette.background.primary} />
    </Scene>
  );
};

export default Nick;
