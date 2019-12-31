import { useEffect } from 'react';
import { useThree } from 'react-three-fiber';

export const useSetDevicePixelRatio = () => {
  const { gl } = useThree();

  useEffect(() => {
    const devicePixelRatio = window.devicePixelRatio.toFixed(1);
    gl.setPixelRatio(devicePixelRatio);
  }, [gl]);
};

// 2*(180/Math.PI) * Math.atan(PlaneSize/(2*CameraDistance));
export const useFOVPerfectFit = distance => {
  const { size, camera } = useThree();
  const aspectRatio = size.width / size.height;

  camera.fov = 50;
  camera.aspect = aspectRatio;
  camera.near = 1;
  camera.far = 10000;

  camera.position.set(0, 0, distance);
};
