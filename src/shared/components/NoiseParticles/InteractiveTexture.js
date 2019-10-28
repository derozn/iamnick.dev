import React from 'react';
import * as THREE from 'three';
import { useRender } from 'react-three-fiber';
import throttle from '@banterstudiosuk/throttle';
import { easeOutQuad } from './easings';

const MAX_AGE = 100;
const RADIUS = 0.5;
const SIZE = 128;

const createCanvas = () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 128;
  canvas.height = 128;

  canvas.style.width = '128px';
  canvas.style.height = '128px';

  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  return { canvas, context };
};

const HitPlane = ({ width, height, onPointerMove }) => (
  <mesh onPointerMove={onPointerMove}>
    <planeGeometry attach="geometry" args={[width, height, 1, 1]} />
    <meshBasicMaterial
      attach="material"
      color={0xffffff}
      wireframe
      depthTest={false}
      visible={false}
    />
  </mesh>
);

const InteractiveTexture = ({ width, height, particles }) => {
  const { canvas, context } = React.useMemo(() => createCanvas(), []);
  const canvasTexture = React.useMemo(() => new THREE.Texture(canvas), [canvas]);
  const trail = React.useRef([]);

  const createParticle = React.useCallback(
    throttle(event => {
      const { uv: point } = event;

      let force = 0;

      const last = trail.current[trail.current.length - 1];

      if (last) {
        const dx = last.x - point.x;
        const dy = last.y - point.y;
        const dd = dx * dx + dy * dy;

        force = Math.min(dd * 10000, 1);
      }

      trail.current.push({ x: point.x, y: point.y, age: 0, force });
    }),
    []
  );

  const updateParticles = React.useCallback(() => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    trail.current.forEach((point, i) => {
      point.age++;

      if (point.age > MAX_AGE) {
        trail.current.splice(i, 1);
      }
    });
  }, [canvas]);

  const renderParticles = React.useCallback(() => {
    trail.current.forEach(point => {
      const pos = {
        x: point.x * SIZE,
        y: (1 - point.y) * SIZE,
      };

      let intensity = 1;

      if (point.age < MAX_AGE * 0.3) {
        intensity = easeOutQuad(point.age / (MAX_AGE * 0.3), 0, 1, 1);
      } else {
        intensity = easeOutQuad(1 - (point.age - MAX_AGE * 0.3) / (MAX_AGE * 0.7), 0, 1, 1);
      }

      intensity *= point.force;

      const radius = SIZE * RADIUS * intensity;
      const grd = context.createRadialGradient(pos.x, pos.y, radius * 0.25, pos.x, pos.y, radius);
      grd.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
      grd.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

      context.beginPath();
      context.fillStyle = grd;
      context.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      context.fill();
    });

    canvasTexture.needsUpdate = true;
  }, [canvas]);

  React.useEffect(() => {
    particles.material.uniforms.uTouch.value = canvasTexture;
  }, [particles]);

  useRender(() => {
    updateParticles();
    renderParticles();
  });

  return <HitPlane width={width} height={height} onPointerMove={createParticle} />;
};

export default InteractiveTexture;
