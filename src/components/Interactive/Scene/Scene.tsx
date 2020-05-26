import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from 'react-three-fiber';
import { useTheme } from 'styled-components';

const Fog = dynamic(() => import('#components/Interactive/Fog'), { ssr: false });
const FaceParticles = dynamic(() => import('#components/Interactive/FaceParticles'), {
  ssr: false,
});
const Effects = dynamic(() => import('#components/Interactive/Effects'), { ssr: false });

const Scene = () => {
  const theme = useTheme();

  return (
    <Canvas
      data-testid="scene"
      resize={{ scroll: true, debounce: { scroll: 50, resize: 20 } }}
      concurrent
      pixelRatio={1}
      camera={{ zoom: 1, position: [0, 0, 300] }}
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
