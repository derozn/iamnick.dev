import React, { Suspense } from 'react';
import { Canvas } from 'react-three-fiber';
import { useTheme } from 'styled-components';

import Fog from '#components/Interactive/Fog';
import FaceParticles from '#components/Interactive/FaceParticles';
import Effects from '#components/Interactive/Effects';

const Scene = () => {
  const theme = useTheme();

  return (
    <Canvas
      data-testid="scene"
      resize={{ scroll: true, debounce: { scroll: 50, resize: 20 } }}
      concurrent
      pixelRatio={1}
      camera={{ zoom: 1, position: [0, 0, 300], far: 50000 }}
      onCreated={({ gl }) => {
        gl.setClearColor(theme.palette.background.primary);
      }}
    >
      <Suspense fallback={null}>
        <Fog />
        <FaceParticles />
        <Effects backgroundColor={theme.palette.background.primary} />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
