import React from 'react';
import { useTheme } from 'styled-components';

import FaceParticles from '#components/Interactive/FaceParticles';
import Effects from '#components/Interactive/Effects';
import Scene from '#components/Interactive/Scene';
import useStore from '#store';

const Work = ({ index }: { index: number }) => {
  const theme = useTheme();
  const { textureUrls } = useStore((state) => state.work);

  return (
    <Scene>
      <FaceParticles textureUrl={textureUrls[index]} position={[25, 0, 0]} />
      <Effects backgroundColor={theme.palette.background.primary} />
    </Scene>
  );
};

export default Work;
