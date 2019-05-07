import React from 'react';
import * as THREE from 'three';
import glslify from 'glslify';
import { useRender } from 'react-three-fiber';
import { TweenLite } from 'gsap';

import InteractiveTexture from './InteractiveTexture';

const TEXTURE_URLS = [
  '/images/character_n.png',
  '/images/character_y.png',
  '/images/character_a.png',
  '/images/character_v.png',
];

const getImageData = image => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');

  ctx.scale(1, -1);
  ctx.drawImage(image, 0, 0, image.width, image.height * -1);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const useTexturesLoader = () => {
  const [textures, setTextures] = React.useState(null);
  const loadedTextures = React.useRef([]);

  React.useEffect(() => {
    const adjustImage = image => {
      image.minFilter = THREE.LinearFilter;
      image.magFilter = THREE.LinearFilter;
      image.format = THREE.RGBFormat;

      if (loadedTextures.current.length < TEXTURE_URLS.length - 1) {
        loadedTextures.current.push(image);
      } else {
        setTextures(loadedTextures.current);
      }
    };

    TEXTURE_URLS.forEach(url => new THREE.TextureLoader().load(url, adjustImage));
  }, []);

  return textures;
};

const ParticleField = () => {
  const pointMesh = React.useRef();
  const [dimensions, setDimensions] = React.useState(null);
  const [isReady, setReady] = React.useState(false);

  // Textures
  const textures = useTexturesLoader();

  React.useEffect(() => {
    if (!textures) {
      return;
    }

    const [{ image }] = textures;
    const { width, height } = image;
    const numberOfPoints = width * height;
    const threshold = 34;

    const { data } = getImageData(image);
    const originalColors = Float32Array.from(data);

    let numberOfVisiblePoints = 0;

    for (let i = 0; i < numberOfPoints; i++) {
      if (originalColors[i * 4 + 0] > threshold) {
        numberOfVisiblePoints += 1;
      }
    }

    // eslint-disable-next-line global-require
    const vertexShader = glslify(require('./particle.vert').default);

    // eslint-disable-next-line global-require
    const fragmentShader = glslify(require('./particle.frag').default);

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        uBaseColor: { value: new THREE.Color(0x00aeff) },
        uTime: { value: 0 },
        uRandom: { value: 1.0 },
        uDepth: { value: 2.0 },
        uSize: { value: 0.0 },
        uTextureSize: { value: new THREE.Vector2(width, height) },
        uTexture: { value: image },
        uTouch: { value: null },
      },
      vertexShader,
      fragmentShader,
      depthTest: false,
      transparent: true,
    });

    const geometry = new THREE.InstancedBufferGeometry();

    // positions
    const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);
    geometry.addAttribute('position', positions);

    // uvs
    const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXYZ(0, 0.0, 0.0);
    uvs.setXYZ(1, 1.0, 0.0);
    uvs.setXYZ(2, 0.0, 1.0);
    uvs.setXYZ(3, 1.0, 1.0);
    geometry.addAttribute('uv', uvs);

    // index
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

    const indices = new Uint16Array(numberOfVisiblePoints);
    const offsets = new Float32Array(numberOfVisiblePoints * 3);
    const angles = new Float32Array(numberOfVisiblePoints);

    for (let i = 0, j = 0; i < numberOfPoints; i++) {
      if (originalColors[i * 4 + 0] > threshold) {
        offsets[j * 3 + 0] = i % width;
        offsets[j * 3 + 1] = Math.floor(i / width);

        indices[j] = i;

        angles[j] = Math.random() * Math.PI;

        j += 1;
      }
    }

    geometry.addAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
    geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
    geometry.addAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));

    pointMesh.current = new THREE.Mesh(geometry, material);

    setDimensions({ width, height });

    setReady(true);
  }, [textures]);

  React.useEffect(() => {
    if (isReady) {
      const particles = pointMesh.current;

      TweenLite.fromTo(particles.material.uniforms.uSize, 1.0, { value: 0.5 }, { value: 1.5 });
      TweenLite.to(particles.material.uniforms.uRandom, 1.0, { value: 2.0 });
      TweenLite.fromTo(
        particles.material.uniforms.uDepth,
        1.0 * 1.5,
        { value: 40.0 },
        { value: 4.0 }
      );
    }
  }, [isReady]);

  useRender(() => {
    if (pointMesh.current) {
      pointMesh.current.material.uniforms.uTime.value += 0.1;
    }
  });

  return isReady ? (
    <>
      <primitive object={pointMesh.current} />
      <InteractiveTexture
        width={dimensions.width}
        height={dimensions.height}
        particles={pointMesh.current}
      />
    </>
  ) : null;
};

export default ParticleField;
