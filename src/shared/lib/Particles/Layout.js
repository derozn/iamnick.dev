import React, { Suspense } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSetDevicePixelRatio, useFOVPerfectFit } from './hooks';

const WebGlLayer = ({ children }) => {
  useSetDevicePixelRatio();
  useFOVPerfectFit(220);

  return <Suspense fallback={null}>{children}</Suspense>;
};

const Layout = ({ children }) => (
  <Canvas>
    <WebGlLayer>{children}</WebGlLayer>
  </Canvas>
);

export default Layout;
