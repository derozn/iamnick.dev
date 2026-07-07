'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { PlaneGeometry, ShaderMaterial } from 'three';

import { useSceneStore } from '@/store/scene';

/**
 * LoaderVeil — the Bruno-Simon-style loading screen, drawn IN the canvas as a
 * fullscreen shader quad instead of an HTML overlay.
 *
 * Sequence (all driven by store state, eased in the shader's uniforms):
 *   1. Loading — an opaque letterpress-dark veil: film grain, vignette, and a
 *      16-bulb marquee rail that lights up with REAL asset progress (drei
 *      useProgress across all 255+ GLBs/textures), each lit bulb flickering.
 *   2. Reveal — on `sceneReady` a spotlight disc irises open at screen centre,
 *      framing the entrance vignette (the HTML "click to enter" arrow points at
 *      its rim — the disc radius matches the old 23vmin CSS disc).
 *   3. Enter — on `started` the disc expands past the corners with a noise-eaten
 *      dissolve edge, synced with the camera pull-out; then the quad unmounts.
 *
 * It mounts OUTSIDE the scene Suspense so it renders while the GLBs stream in,
 * and self-invalidates while visible so the low tier's demand frameloop keeps
 * animating it. The HTML splash in IntroOverlay covers the window before the 3-D
 * chunk arrives; it fades as soon as this quad reports its first rendered frame
 * (`veilLive`) — same base colours, so the swap is seamless.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpot;     // 0 covered -> 1 spotlight open (sceneReady)
  uniform float uReveal;   // 0 holding -> 1 fully irised open (started)
  uniform float uAspect;   // canvas width / height

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // cheap value noise for the dissolve edge
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
    // aspect-corrected coords centred on screen; 1 unit = canvas height
    vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
    float vmin = min(uAspect, 1.0);

    // --- letterpress backdrop: vertical gradient + grain + vignette ---
    vec3 top = vec3(0.078, 0.078, 0.122);    // #14141f
    vec3 bottom = vec3(0.027, 0.031, 0.063); // #070810
    vec3 col = mix(bottom, top, vUv.y);
    col += (hash(vUv * 913.7 + fract(uTime) * 7.3) - 0.5) * 0.045; // film grain
    col *= 1.0 - 0.45 * dot(p, p);                                  // vignette

    // (the bulb-marquee progress rail is DOM, in IntroOverlay — it must exist
    // from the very first HTML paint, before this shader's chunk has even
    // downloaded, and swapping designs mid-load looked like two loaders)

    // --- spotlight iris: hole in the veil, warm rim ---
    // disc radius matches the retired CSS disc (23vmin) at uSpot=1, then blows
    // past the far corner on reveal with a noise-eaten edge.
    float d = length(p);
    float maxR = length(vec2(uAspect, 1.0)) * 0.5 + 0.1;
    float r = uSpot * 0.23 * vmin + uReveal * uReveal * maxR;
    r += (vnoise(p * 9.0 + uTime * 0.15) - 0.5) * 0.16 * r * (1.0 - uReveal);
    float edge = 0.02 * vmin + 0.06 * uReveal;
    float veil = smoothstep(r - edge * 0.25, r + edge, d); // 0 inside hole, 1 outside

    // warm rim glow hugging the iris edge (the "old" disc's brass halo)
    float rim = smoothstep(edge * 2.5, 0.0, abs(d - r)) * uSpot * (1.0 - uReveal);
    col += vec3(1.0, 0.73, 0.47) * rim * 0.35;

    gl_FragColor = vec4(col, veil);
  }
`;

// NB: loading progress is SAMPLED from drei's store inside useFrame below, not
// subscribed to with the useProgress() hook — loaders register synchronously
// while other components (e.g. Ride's useGLTF) are still rendering, and a
// hook subscription turns that into a setState-during-render warning.

export function LoaderVeil() {
  const [done, setDone] = useState(false);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const live = useRef(false);

  // Inline uniforms in useMemo, mutated only via the material ref in useFrame
  // (never read refs in render) — the codebase's standing shader-material rule.
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uSpot: { value: 0 },
          uReveal: { value: 0 },
          uAspect: { value: 1 },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
  const matRef = useRef<ShaderMaterial>(null);

  useFrame((_, delta) => {
    const m = matRef.current;
    if (!m || done) return;
    const dt = Math.min(delta, 0.1);
    const u = m.uniforms;
    const st = useSceneStore.getState();

    if (!live.current) {
      // first rendered frame — the HTML splash can hand over now
      live.current = true;
      st.setVeilLive(true);
    }

    // mirror drei's load progress into the scene store (drives the DOM bulb
    // rail + %); sampled here so the write happens outside React render
    st.setLoadProgress(useProgress.getState().progress / 100);

    u.uTime.value += dt;
    u.uAspect.value = size.width / size.height;
    // ease the spotlight open on ready, the full iris on start
    const wantSpot = st.sceneReady ? 1 : 0;
    u.uSpot.value += (wantSpot - u.uSpot.value) * Math.min(1, dt * 2.2);
    const wantReveal = st.started ? 1 : 0;
    u.uReveal.value += (wantReveal - u.uReveal.value) * Math.min(1, dt * 1.6);

    if (u.uReveal.value > 0.995) {
      setDone(true);
      return;
    }
    // self-sustaining render loop while visible (demand frameloop on low tier)
    invalidate();
  });

  if (done) return null;
  return (
    <mesh
      geometry={geometry}
      material={material}
      ref={(el) => {
        // material ref for useFrame without touching the hook return in render
        matRef.current = el ? (el.material as ShaderMaterial) : null;
      }}
      renderOrder={9999}
      frustumCulled={false}
    />
  );
}
