import React, { useMemo } from 'react';
import glslify from 'glslify';
import * as THREE from 'three';
import { useLoader } from 'react-three-fiber';
import { useSpring, animated } from 'react-spring/three';

import { getImageData } from './utils';
import Layout from './Layout';

import rawVertexShader from './shaders/particle.vert';
import rawFragmentShader from './shaders/particle.frag';

const vertexShader = glslify(rawVertexShader);
const fragmentShader = glslify(rawFragmentShader);

const TEXTURE_URLS = [
  '/images/profile.png',
  '/images/character_y.png',
  '/images/character_a.png',
  '/images/character_v.png',
];

const PositionBufferAttribute = props => {
  const array = [-0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0];
  return <bufferAttribute array={Float32Array.from(array)} {...props} />;
};

const UvBufferAttribute = props => {
  const array = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0];
  return <bufferAttribute array={Float32Array.from(array)} {...props} />;
};

const Profile = () => {
  const [texture] = useLoader(THREE.TextureLoader, TEXTURE_URLS);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;

  const threshold = 34;
  const { image } = texture;
  const { width, height } = image;
  const numPoints = width * height;

  const originalColors = useMemo(() => Float32Array.from(getImageData(image).data), [image]);

  let numVisible = 0;

  for (let i = 0; i < numPoints; i++) {
    if (originalColors[i * 4 + 0] > threshold) numVisible++;
  }

  const indices = new Uint16Array(numVisible);
  const offsets = new Float32Array(numVisible * 3);
  const angles = new Float32Array(numVisible);

  for (let i = 0, j = 0; i < numPoints; i++) {
    if (originalColors[i * 4 + 0] > threshold) {
      offsets[j * 3 + 0] = i % width;
      offsets[j * 3 + 1] = Math.floor(i / width);

      indices[j] = i;

      angles[j] = Math.random() * Math.PI;

      j++;
    }
  }

  const { size, time } = useSpring({
    from: { size: 0.0, time: 0.0 },
    to: { size: 1.0, time: 1.0 },
    reset: true,
  });

  return (
    <mesh>
      <instancedBufferGeometry attach="geometry">
        <bufferAttribute attach="index" args={[new Uint16Array([0, 2, 1, 2, 3, 1]), 1]} />
        <PositionBufferAttribute
          attachObject={['attributes', 'position']}
          args={[new Float32Array(4 * 3), 3]}
        />

        <UvBufferAttribute
          attachObject={['attributes', 'uv']}
          args={[new Float32Array(4 * 2), 2]}
        />

        <instancedBufferAttribute
          attachObject={['attributes', 'pindex']}
          args={[indices, 1, false]}
        />

        <instancedBufferAttribute
          attachObject={['attributes', 'offset']}
          args={[offsets, 3, false]}
        />

        <instancedBufferAttribute
          attachObject={['attributes', 'angle']}
          args={[angles, 1, false]}
        />
      </instancedBufferGeometry>
      <animated.rawShaderMaterial
        attach="material"
        args={[
          {
            uniforms: {
              uTime: { value: 0.0 },
              uRandom: { value: 1.0 },
              uDepth: { value: 2.0 },
              uSize: { value: 0.0 },
              uTextureSize: { value: new THREE.Vector2(width, height) },
              uTexture: { value: texture },
              uTouch: { value: null },
            },
            vertexShader,
            fragmentShader,
            depthTest: false,
            transparent: true,
          },
        ]}
        uniforms-uTime-value={time}
        uniforms-uSize-value={size}
      />
    </mesh>
  );
};

const Particles = () => (
  <Layout>
    <Profile />
  </Layout>
);

export default Particles;
