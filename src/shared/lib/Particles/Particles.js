import React, { useEffect, useRef } from 'react';
import glslify from 'glslify';
import * as THREE from 'three';
import { useLoader, useUpdate } from 'react-three-fiber';
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
  const ref = useRef();

  useUpdate(attribute => {
    attribute.setXYZ(0, -0.5, 0.5, 0.0);
    attribute.setXYZ(1, 0.5, 0.5, 0.0);
    attribute.setXYZ(2, -0.5, -0.5, 0.0);
    attribute.setXYZ(3, 0.5, -0.5, 0.0);
  }, []);

  return <bufferAttribute ref={ref} {...props} />;
};

const UvBufferAttribute = props => {
  const ref = useRef();

  useUpdate(attribute => {
    attribute.setXYZ(0, 0.0, 0.0);
    attribute.setXYZ(1, 1.0, 0.0);
    attribute.setXYZ(2, 0.0, 1.0);
    attribute.setXYZ(3, 1.0, 1.0);
  }, []);

  return <bufferAttribute ref={ref} {...props} />;
};

const Profile = () => {
  const texture = useLoader(THREE.TextureLoader, '/images/profile.png');

  const { image } = texture;
  const { width, height } = image;
  const numPoints = width * height;

  const indices = new Uint16Array(numPoints);
  const offsets = new Float32Array(numPoints * 3);
  const angles = new Float32Array(numPoints);

  for (let i = 0; i < numPoints; i++) {
    offsets[i * 3 + 0] = i % width;
    offsets[i * 3 + 1] = Math.floor(i / width);

    indices[i] = i;

    angles[i] = Math.random() * Math.PI;
  }

  return (
    <mesh>
      <instancedBufferGeometry attach="geometry">
        <bufferAttribute attach="index" args={[new Uint16Array([0, 2, 1, 2, 3, 1]), 1]} />
        <PositionBufferAttribute
          attachObject={['attributes', 'position']}
          args={[new Float32Array(4 * 3), 3]}
        />

        <UvBufferAttribute
          attachObject={['attributes', 'position']}
          args={[new Float32Array(4 * 3), 3]}
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
      <rawShaderMaterial
        attach="material"
        args={[
          {
            uniforms: {
              uBaseColor: { value: new THREE.Color(0xffffff) },
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
          },
        ]}
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
