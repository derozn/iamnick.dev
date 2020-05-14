import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from 'react-three-fiber';

import useStore from '#store';

const Skull = dynamic(() => import('#components/Interactive/Skull'), { ssr: false });

const Scene = () => {
  const { zoom, position, backgroundColor } = useStore((state) => ({
    zoom: state.zoom,
    position: state.position,
    backgroundColor: state.backgroundColor,
  }));

  return (
    <Canvas
      data-testid="scene"
      concurrent
      pixelRatio={1}
      orthographic
      camera={{ zoom, position }}
      onCreated={({ gl }) => {
        gl.setClearColor(backgroundColor);
      }}
    >
      <Suspense fallback={null}>
        <Skull />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
