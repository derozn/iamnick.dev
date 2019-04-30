import React from 'react';
import { tween } from 'shifty';
import { Canvas, useThree, useRender, apply } from 'react-three-fiber';
import {
  BufferAttribute,
  TextureLoader,
  LinearFilter,
  RGBFormat,
  Vector2,
  RawShaderMaterial,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Mesh,
} from 'three';
import glslify from 'glslify';
import { GlitchEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';

const TEXTURE_URL = '/images/profile.png';

apply({ EffectComposer, RenderPass, EffectPass });

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

  // const cameraFOV = 2 * Math.atan(size.width / aspectRatio / (2 * distance)) * (180 / Math.PI);

  camera.fov = 50;
  camera.aspect = aspectRatio;
  camera.near = 1;
  camera.far = 10000;

  camera.position.set(-50, 0, distance);
};

const useTextureLoader = () => {
  const [texture, setTexture] = React.useState(null);

  const adjustImage = image => {
    image.minFilter = LinearFilter;
    image.magFilter = LinearFilter;
    image.format = RGBFormat;

    setTexture(image);
  };

  React.useEffect(() => {
    new TextureLoader().load(TEXTURE_URL, adjustImage);
  }, []);

  return texture;
};

const ParticleField = () => {
  const { camera } = useThree();
  const particleMesh = React.useRef();
  const [isReady, setReady] = React.useState(false);
  const [scale, setScale] = React.useState([0, 0, 1]);

  useSetDevicePixelRatio();
  useFOVPerfectFit(100);

  // Textures
  const texture = useTextureLoader();

  React.useEffect(() => {
    if (!texture) {
      return;
    }

    const {
      image: { width, height },
    } = texture;

    const numberOfPoints = width * height;
    const threshold = 34;
    let numVisible = 0;
    let originalColors;

    const img = texture.image;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    ctx.scale(1, -1);
    ctx.drawImage(img, 0, 0, width, height * -1);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    originalColors = Float32Array.from(imgData.data);

    for (let i = 0; i < numberOfPoints; i++) {
      if (originalColors[i * 4 + 0] > threshold) numVisible++;
    }

    const uniforms = {
      uTime: { value: 0 },
      uRandom: { value: 1.0 },
      uDepth: { value: 2.0 },
      uSize: { value: 0.0 },
      uTextureSize: { value: new Vector2(width, height) },
      uTexture: { value: texture },
      uTouch: { value: null },
    };

    const material = new RawShaderMaterial({
      uniforms,
      vertexShader: glslify(require('./particle.vert').default),
      fragmentShader: glslify(require('./particle.frag').default),
      depthTest: false,
      transparent: true,
    });

    const geometry = new InstancedBufferGeometry();

    // positions
    const positions = new BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);
    geometry.addAttribute('position', positions);

    // uvs
    const uvs = new BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXYZ(0, 0.0, 0.0);
    uvs.setXYZ(1, 1.0, 0.0);
    uvs.setXYZ(2, 0.0, 1.0);
    uvs.setXYZ(3, 1.0, 1.0);
    geometry.addAttribute('uv', uvs);

    // index
    geometry.setIndex(new BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

    const indices = new Uint16Array(numVisible);
    const offsets = new Float32Array(numVisible * 3);
    const angles = new Float32Array(numVisible);

    for (let i = 0, j = 0; i < numberOfPoints; i++) {
      if (originalColors[i * 4 + 0] <= threshold) {
        continue;
      }

      offsets[j * 3 + 0] = i % width;
      offsets[j * 3 + 1] = Math.floor(i / width);

      indices[j] = i;

      angles[j] = Math.random() * Math.PI;

      j++;
    }

    geometry.addAttribute('pindex', new InstancedBufferAttribute(indices, 1, false));
    geometry.addAttribute('offset', new InstancedBufferAttribute(offsets, 3, false));
    geometry.addAttribute('angle', new InstancedBufferAttribute(angles, 1, false));

    particleMesh.current = new Mesh(geometry, material);
    setReady(true);
  }, [texture]);

  React.useEffect(() => {
    if (!isReady) return;

    const fovHeight = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
    const scale = fovHeight / texture.image.height;

    setScale([scale, scale, 1]);
  }, [isReady]);

  React.useEffect(() => {
    if (!isReady) {
      return;
    }

    tween({
      from: { size: 0.1, random: 0, depth: 40.0 },
      to: { size: 0.2, random: 2.0, depth: 2.0 },
      duration: 2000,
      easing: 'easeOutQuad',
      step: ({ size, random, depth }) => {
        particleMesh.current.material.uniforms.uSize.value = size;
        particleMesh.current.material.uniforms.uRandom.value = random;
        particleMesh.current.material.uniforms.uDepth.value = depth;
      },
    });
  }, [isReady]);

  useRender(() => {
    if (!particleMesh.current) {
      return;
    }

    particleMesh.current.material.uniforms.uTime.value += 0.05;
  });

  return isReady ? (
    <scene>
      <primitive object={particleMesh.current} scale={scale} />
    </scene>
  ) : null;
};

const NoiseParticles = () => (
  <Canvas>
    <ParticleField />
  </Canvas>
);

export default NoiseParticles;
