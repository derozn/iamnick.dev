import React from 'react';
import { Canvas, useThree } from 'react-three-fiber';

const useSetDevicePixelRatio = () => {
  const { gl } = useThree();

  React.useEffect(() => {
    const devicePixelRatio = window.devicePixelRatio.toFixed(1);
    gl.setPixelRatio(devicePixelRatio);
  }, [gl]);
};

const useFOVPerfectFit = distance => {
  const { size, camera } = useThree();
  const aspectRatio = size.width / size.height;

  camera.fov = 50;
  camera.aspect = aspectRatio;
  camera.near = 1;
  camera.far = 10000;

  camera.position.set(0, 0, distance);
};

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
