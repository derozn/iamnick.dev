import React from 'react';
import * as THREE from 'three';
import { useRender } from 'react-three-fiber';
import { getImageData } from './utils';
import Layout from './Layout';

const TEXTURE_URLS = [
  '/images/profile.png',
  '/images/character_n.png',
  '/images/character_y.png',
  '/images/character_a.png',
  '/images/character_v.png',
];

const useTexturesLoader = () => {
  const [textures, setTextures] = React.useState(null);

  React.useEffect(() => {
    const adjustTexture = texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;

      return texture;
    };

    const loadTextures = async () => {
      const asyncTextureLoaders = TEXTURE_URLS.map(
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
  }, []);

  return textures;
};

const Particles = () => {
  return <Layout />;
};

export default Particles;
