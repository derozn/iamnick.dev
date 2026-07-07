'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  type Group,
  type Mesh,
  RepeatWrapping,
  ShaderMaterial,
  type Texture,
} from 'three';

import { getGlowTexture } from './bulbGlowExtract';

/**
 * Atmosphere — the cheap set dressing that sells the night: a gradient sky dome
 * whose horizon *is* the fog colour (so the fogged ground meets the sky with no
 * seam), a starfield, a hazy moon along the moon-key light's direction, slow
 * searchlight beams sweeping over the big rides, and drifting ground-fog sheets
 * at the map edges.
 *
 * Perf contract (the fragile-GPU rule): zero lights, zero render targets, a
 * handful of draw calls, and every animated piece is high-tier-only (where the
 * frameloop is already `always`) so the low tier's demand loop stays quiet.
 */

/** Sky colours — horizon MUST match Scene's FOG for an invisible seam. */
const HORIZON = '#2b2f57';
const ZENITH = '#12142e';

/** Searchlight anchors (three-space): big top, carousel, ferris wheel. */
const BEAMS: { pos: [number, number, number]; speed: number; phase: number }[] = [
  { pos: [-1.6, 0, 21], speed: 0.12, phase: 0.4 },
  { pos: [23.7, 0, 25.4], speed: 0.17, phase: 2.4 },
  { pos: [-22.2, 0, 28.6], speed: 0.09, phase: 4.2 },
];

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

const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BEAM_FRAG = /* glsl */ `
  varying vec2 vUv;
  void main() {
    // brightest at the source (apex sits at v=1 after the flip), fading up,
    // with soft side edges so the cone reads volumetric not CG-hard
    float a = pow(vUv.y, 2.2) * 0.16;
    a *= smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
    gl_FragColor = vec4(vec3(1.0, 0.86, 0.62), a);
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

function makeBeam() {
  return new ShaderMaterial({
    vertexShader: BEAM_VERT,
    fragmentShader: BEAM_FRAG,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
}

/** Moon disc + halo, billboarded along the moon-key light direction [40,90,50]. */
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
  const beamMaterial = useMemo(() => makeBeam(), []);
  const moonRef = useRef<Group>(null);
  const beamRefs = useRef<(Group | null)[]>([]);
  const fogRefs = useRef<(Mesh | null)[]>([]);

  const fogTex = useTexture('/textures/fog.png', (t) => {
    const tex = t as Texture;
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.needsUpdate = true;
  }) as Texture;
  // each sheet scrolls independently, so each needs its OWN texture (clones
  // share the underlying image — no extra VRAM)
  const sheetTextures = useMemo(() => FOG_SHEETS.map(() => fogTex.clone()), [fogTex]);

  useFrame(({ camera, clock }) => {
    // moon always faces the camera (cheap billboard — one quaternion copy)
    moonRef.current?.quaternion.copy(camera.quaternion);
    if (!high) return; // sweeps + fog drift are high-tier-only (frameloop=always)
    const t = clock.elapsedTime;
    BEAMS.forEach((b, i) => {
      const g = beamRefs.current[i];
      if (g) g.rotation.y = t * b.speed * Math.PI * 2 * 0.16 + b.phase;
    });
    fogRefs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as { map?: Texture | null };
      mat.map?.offset.set((t * 0.006 + i * 0.37) % 1, (t * 0.0042 * (i % 2 ? -1 : 1)) % 1);
    });
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

      {/* searchlights sweeping the sky above the big rides (high tier only) */}
      {high &&
        BEAMS.map((b, i) => (
          <group
            key={i}
            position={b.pos}
            ref={(el) => {
              beamRefs.current[i] = el;
            }}
          >
            {/* tilt the beam off vertical; the parent group spins about Y */}
            <group rotation={[0.32, 0, 0]}>
              {/* rotateX(PI) puts the cone's apex at the ground (v=1 there) */}
              <mesh material={beamMaterial} position={[0, 21, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[5.5, 42, 16, 1, true]} />
              </mesh>
            </group>
          </group>
        ))}

      {/* drifting ground-fog sheets at the field edges */}
      {FOG_SHEETS.map((f, i) => (
        <mesh
          key={i}
          position={f.pos}
          rotation={[-Math.PI / 2, 0, i * 1.2]}
          ref={(el) => {
            fogRefs.current[i] = el;
          }}
        >
          <planeGeometry args={f.size} />
          <meshBasicMaterial
            map={sheetTextures[i]}
            transparent
            opacity={0.14}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}
