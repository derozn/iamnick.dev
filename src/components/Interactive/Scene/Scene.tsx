import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from 'react-three-fiber';

import useStore from '#store';

const Skull = dynamic(() => import('#components/Interactive/Skull'), { ssr: false });

const Scene = () => {
  const { zoom, position } = useStore((state) => ({ zoom: state.zoom, position: state.position }));

  return (
    <Canvas data-testid="scene" concurrent pixelRatio={1} orthographic camera={{ zoom, position }}>
      <Suspense fallback={null}>
        <Skull />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
