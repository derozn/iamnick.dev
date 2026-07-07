'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { AdditiveBlending, BackSide, Color, type Group, type Mesh, ShaderMaterial } from 'three';

import { getGlowTexture } from './bulbGlowExtract';

/**
 * Atmosphere — the cheap set dressing that sells the night: a gradient sky dome
 * whose horizon *is* the fog colour (so the fogged ground meets the sky with no
 * seam), a starfield, a hazy moon along the moon-key light's direction, and
 * drifting ground-fog sheets at the map edges. (Sweeping searchlight cones were
 * tried and cut — from the fixed iso angle they always read as clipping through
 * the ride geometry.)
 *
 * Perf contract (the fragile-GPU rule): zero lights, zero render targets, a
 * handful of draw calls, and every animated piece is high-tier-only (where the
 * frameloop is already `always`) so the low tier's demand loop stays quiet.
 */

/** Sky colours — horizon MUST match Scene's FOG for an invisible seam. */
const HORIZON = '#2b2f57';
const ZENITH = '#12142e';

/** Ground-fog sheets: centre + size, hugging the field's dark edges. */
const FOG_SHEETS: { pos: [number, number, number]; size: [number, number] }[] = [
  { pos: [0, 0.25, -34], size: [34, 16] },
  { pos: [30, 0.3, 4], size: [30, 14] },
  { pos: [-26, 0.28, 14], size: [30, 14] },
];

const SKY_VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  varying vec3 vPos;
  uniform vec3 uHorizon;
  uniform vec3 uZenith;
  void main() {
    // blend on altitude; hold the horizon colour a while before climbing
    float h = clamp(normalize(vPos).y, 0.0, 1.0);
    gl_FragColor = vec4(mix(uHorizon, uZenith, smoothstep(0.02, 0.55, h)), 1.0);
  }
`;

const UV_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FOG_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    // two octaves of drifting value noise — seamless by construction (the old
    // tiled fog.png was a single puff sprite, so repeating it read as squares)
    vec2 p = vUv * vec2(5.0, 2.6);
    float n = vnoise(p + vec2(uTime * 0.045, uTime * 0.02));
    n += 0.5 * vnoise(p * 2.3 - vec2(uTime * 0.03, uTime * 0.055));
    n /= 1.5;
    n = smoothstep(0.35, 0.85, n);
    // soft falloff on every side so the sheet has no visible rectangle edge
    float fade = smoothstep(0.0, 0.28, vUv.x) * smoothstep(1.0, 0.72, vUv.x)
               * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
    gl_FragColor = vec4(vec3(0.62, 0.65, 0.85), n * fade * 0.16);
  }
`;

function makeSky() {
  return new ShaderMaterial({
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
    uniforms: {
      uHorizon: { value: new Color(HORIZON) },
      uZenith: { value: new Color(ZENITH) },
    },
    side: BackSide,
    depthWrite: false,
  });
}

function makeGroundFog() {
  return new ShaderMaterial({
    vertexShader: UV_VERT,
    fragmentShader: FOG_FRAG,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
  });
}

/**
 * Moon disc + halo, billboarded, hung in the FAR (+x/+z) quadrant where the
 * fixed iso camera can actually see it. NB deliberately decoupled from the key
 * directional, which lives in the CAMERA's quadrant so facades light correctly
 * (a key under the visible moon back-lit the whole scene — see DynamicLights).
 */
const MOON_DIR = (() => {
  const l = Math.hypot(40, 90, 50);
  return [40 / l, 90 / l, 50 / l] as const;
})();
const MOON_DIST = 150;
const MOON_POS: [number, number, number] = [
  MOON_DIR[0] * MOON_DIST,
  MOON_DIR[1] * MOON_DIST,
  MOON_DIR[2] * MOON_DIST,
];

export function Atmosphere({ high }: { high: boolean }) {
  const skyMaterial = useMemo(() => makeSky(), []);
  const fogMaterial = useMemo(() => makeGroundFog(), []);
  const moonRef = useRef<Group>(null);
  // uniforms are mutated through this element ref in useFrame (never through the
  // useMemo return — the codebase's react-hooks/immutability rule)
  const fogMeshRef = useRef<Mesh>(null);

  useFrame(({ camera, clock }) => {
    // moon always faces the camera (cheap billboard — one quaternion copy)
    moonRef.current?.quaternion.copy(camera.quaternion);
    if (!high) return; // fog drift is high-tier-only (frameloop=always)
    const fogMat = fogMeshRef.current?.material as ShaderMaterial | undefined;
    if (fogMat) fogMat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      {/* sky dome + stars — inside the far plane, behind the whole carnival */}
      <mesh material={skyMaterial} renderOrder={-10}>
        <sphereGeometry args={[180, 24, 16]} />
      </mesh>
      <Stars radius={150} depth={40} count={2200} factor={4} saturation={0} fade speed={0.6} />

      {/* moon: pale disc + warm halo sprite, billboarded */}
      <group ref={moonRef} position={MOON_POS}>
        <mesh>
          <circleGeometry args={[6.5, 32]} />
          <meshBasicMaterial color="#e8e2cd" toneMapped={false} fog={false} />
        </mesh>
        <sprite scale={[30, 30, 1]}>
          <spriteMaterial
            map={getGlowTexture()}
            color="#cdc4e8"
            transparent
            opacity={0.5}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            fog={false}
          />
        </sprite>
      </group>

      {/* drifting ground-fog sheets at the field edges — procedural noise with
          faded edges (a tiled sprite texture read as a grid of squares) */}
      {FOG_SHEETS.map((f, i) => (
        <mesh
          key={i}
          position={f.pos}
          rotation={[-Math.PI / 2, 0, i * 1.2]}
          material={fogMaterial}
          // one ref is enough — the material (and its uTime) is shared
          ref={i === 0 ? fogMeshRef : undefined}
        >
          <planeGeometry args={f.size} />
        </mesh>
      ))}
    </>
  );
}
