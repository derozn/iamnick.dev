import React, { useEffect, useState } from 'react';
import glslify from 'glslify';
import * as THREE from 'three';
import { useLoader } from 'react-three-fiber';
import { getImageData } from './utils';
import Layout from './Layout';

import rawVertexShader from './shaders/particle.vert';
import rawFragmentShader from './shaders/particle.frag';

const TEXTURE_URLS = [
  '/images/profile.png',
  '/images/character_y.png',
  '/images/character_a.png',
  '/images/character_v.png',
];

const getNumberOfVisiblePoints = ({ texture }) => {
  const { image } = texture;
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

  return {
    threshold,
    numberOfPoints,
    numberOfVisiblePoints,
    originalColors,
  };
};

const getShaderMaterial = ({ vertexShader, fragmentShader, baseColor = 0x00aeff, texture }) => {
  const { image } = texture;
  const { width, height } = image;

  return new THREE.RawShaderMaterial({
    uniforms: {
      uBaseColor: { value: new THREE.Color(baseColor) },
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
};

const getOffsets = ({
  threshold,
  width,
  numberOfPoints,
  numberOfVisiblePoints,
  originalColors,
}) => {
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

  return { indices, offsets, angles };
};

const Profile = () => {
  const [store, setStore] = useState({
    width: 0,
    height: 0,
    shaderMaterial: null,
    indices: null,
    offsets: null,
    angles: null,
  });

  const texture = useLoader(THREE.TextureLoader, '/images/profile.png');

  useEffect(() => {
    if (!texture) {
      return;
    }

    const {
      image: { width, height },
    } = texture;

    const {
      threshold,
      numberOfVisiblePoints,
      originalColors,
      numberOfPoints,
    } = getNumberOfVisiblePoints({
      texture,
    });

    const vertexShader = glslify(rawVertexShader);
    const fragmentShader = glslify(rawFragmentShader);

    const shaderMaterial = getShaderMaterial({ vertexShader, fragmentShader, texture });

    const { indices, offsets, angles } = getOffsets({
      threshold,
      width,
      height,
      numberOfPoints,
      numberOfVisiblePoints,
      originalColors,
    });

    setStore({
      width,
      height,
      shaderMaterial,
      indices,
      offsets,
      angles,
    });
  }, [texture, setStore]);

  const { indices, offsets, angles } = store;

  return (
    <mesh>
      <instancedBufferGeometry
        attach="geometry"
        setIndex={new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)}
      >
        <bufferAttribute
          attachObject={['attributes', 'position']}
          array={new Float32Array(4 * 3)}
          itemSize={3}
          setXYZ={[
            [0, -0.5, 0.5, 0.0],
            [1, 0.5, 0.5, 0.0],
            [2, -0.5, -0.5, 0.0],
            [3, 0.5, -0.5, 0.0],
          ]}
        />

        <bufferAttribute
          attachObject={['attributes', 'uv']}
          array={new Float32Array(4 * 2)}
          itemSize={2}
          setXYZ={[[0, 0.0, 0.0], [1, 1.0, 0.0], [2, 0.0, 1.0], [3, 1.0, 1.0]]}
        />

        <instancedBufferAttribute
          attachObject={['attributes', 'pindex']}
          array={indices}
          itemSize={1}
          normalized={false}
        />

        <instancedBufferAttribute
          attachObject={['attributes', 'offset']}
          array={offsets}
          itemSize={3}
          normalized={false}
        />

        <instancedBufferAttribute
          attachObject={['attributes', 'angle']}
          array={angles}
          itemSize={1}
          normalized={false}
        />
      </instancedBufferGeometry>
    </mesh>
  );
};

const Particles = () => (
  <Layout>
    <Profile />
  </Layout>
);

export default Particles;
