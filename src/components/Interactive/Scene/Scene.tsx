import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from 'react-three-fiber';

import useStore from '#store';

const Fog = dynamic(() => import('#components/Interactive/Fog'), { ssr: false });
const FaceParticles = dynamic(() => import('#components/Interactive/FaceParticles'), {
  ssr: false,
});

const Scene = () => {
  const { zoom, position, backgroundColor } = useStore((state) => ({
    zoom: state.zoom,
    position: state.position,
    backgroundColor: state.background.color,
  }));

  return (
    <Canvas
      data-testid="scene"
      concurrent
      pixelRatio={1}
      camera={{ zoom, position }}
      onCreated={({ gl }) => {
        gl.setClearColor(backgroundColor);
      }}
    >
      <Suspense fallback={null}>
        <Fog />
        <FaceParticles />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
