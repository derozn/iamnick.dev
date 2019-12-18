import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from 'react-three-fiber';
import { isArray } from '@shared/utils';

export const useTexturesLoader = ({ textureUrls }) => {
  const [textures, setTextures] = useState([]);

  useEffect(() => {
    const adjustTexture = texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;

      return texture;
    };

    const loadTextures = async () => {
      const asyncTextureLoaders = (isArray(textureUrls) ? textureUrls : [textureUrls]).map(
        url =>
          new Promise((resolve, reject) =>
            new THREE.TextureLoader().load(url, resolve, undefined, reject)
          )
      );

      const loadedTextures = await Promise.all(asyncTextureLoaders);

      return loadedTextures;
    };

    const createTextures = async () => {
      const loadedTextures = await loadTextures();
      const adjustedTextures = loadedTextures.map(adjustTexture);

      setTextures(adjustedTextures);
    };

    createTextures();
  }, [textureUrls]);

  return textures;
};

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
