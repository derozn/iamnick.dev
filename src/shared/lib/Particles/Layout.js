import React from 'react';
import { Canvas } from 'react-three-fiber';
import { useSetDevicePixelRatio, useFOVPerfectFit } from './hooks';

const WebGlLayer = ({ children }) => {
  useSetDevicePixelRatio();
  useFOVPerfectFit(220);

  return <scene>{children}</scene>;
};

const Layout = ({ children }) => (
  <Canvas>
    <WebGlLayer>{children}</WebGlLayer>
  </Canvas>
);

export default Layout;
