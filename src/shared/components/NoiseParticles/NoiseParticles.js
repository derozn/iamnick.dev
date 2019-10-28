import React from 'react';
import { Canvas, useThree } from 'react-three-fiber';
import ParticleField from './ParticleField';

// Prevents canvas from being blurry
// https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setPixelRatio
const useSetDevicePixelRatio = () => {
  const { gl } = useThree();

  React.useEffect(() => {
    const devicePixelRatio = window.devicePixelRatio.toFixed(1);
    gl.setPixelRatio(devicePixelRatio);
  }, []);
};

// Calculates the perfect FOV (or so they say...)
const useFOVPerfectFit = distance => {
  const { size, camera } = useThree();
  const aspectRatio = size.width / size.height;

  camera.fov = 50;
  camera.aspect = aspectRatio;
  camera.near = 1;
  camera.far = 10000;

  camera.position.set(0, 0, distance);
};

const WebGlLayer = () => {
  useSetDevicePixelRatio();
  useFOVPerfectFit(220);

  return (
    <scene>
      <ParticleField />
    </scene>
  );
};

const NoiseParticles = () => (
  <Canvas>
    <WebGlLayer />
  </Canvas>
);

export default NoiseParticles;
