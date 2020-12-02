import React, { Suspense, FunctionComponent } from 'react';
import { Canvas } from 'react-three-fiber';
import { useTheme } from 'styled-components';

const Scene: FunctionComponent = ({ children }) => {
  const theme = useTheme();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        data-testid="scene"
        concurrent
        pixelRatio={1}
        camera={{ zoom: 1, position: [0, 0, 300], far: 50000 }}
        onCreated={({ gl }) => {
          gl.setClearColor(theme.palette.background.primary);
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
