'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  AdditiveBlending,
  Box3,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  type LineSegments,
  Matrix4,
  type Mesh,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three';

import { useSceneStore } from '@/store/scene';
import { CM, unityTRS } from './conversion';
import { ATTRACTIONS, type Attraction } from './attractions';

/**
 * AttractionOutlines — replaces the floating button markers. Each clickable
 * structure is traced with a **neon edge outline** carrying a bright beam that
 * sweeps around the model, so it reads as interactive without any UI chrome or
 * labels. An invisible box over the model takes the click/hover (→ open section).
 *
 * The beam animates while the camera moves (free under the demand frameloop) and
 * while hovered (we invalidate then); at rest it settles to a steady glow. Bloom
 * (high tier) makes it bristle.
 */

const cmScale = new Matrix4().makeScale(CM, CM, CM);
const NEON = '#ff2d3a';

const VERT = /* glsl */ `
  uniform vec3 uCenter;
  varying float vAngle;
  void main() {
    vec3 d = position - uCenter;
    vAngle = atan(d.x, d.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uActive; // master visibility 0..1 (only the current stop lights up)
  varying float vAngle;
  void main() {
    // a single bright lobe travelling around the silhouette
    float beam = pow(0.5 + 0.5 * sin(vAngle - uTime * 2.0), 6.0);
    float intensity = uActive * (0.5 + beam * 1.7);
    gl_FragColor = vec4(uColor * intensity, 1.0);
  }
`;

const N = ATTRACTIONS.length;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Outline({ a, index }: { a: Attraction; index: number }) {
  const { scene } = useGLTF(`/models/synty/${a.prefab}.glb`, true);
  const invalidate = useThree((s) => s.invalidate);
  const open = useSceneStore((s) => s.open);
  const [hover, setHover] = useState(false);
  const lineRef = useRef<LineSegments>(null);

  // Trace every sub-mesh's edges into one line geometry, baked into the prefab's
  // local cm-space (same space InstancedPrefab renders the actual model in).
  const { geom, center, size } = useMemo(() => {
    scene.updateWorldMatrix(true, true);
    const pts: number[] = [];
    const box = new Box3();
    const v = new Vector3();
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh || !m.geometry) return;
      const eg = new EdgesGeometry(m.geometry, 30);
      const wm = new Matrix4().multiplyMatrices(cmScale, m.matrixWorld);
      const p = eg.getAttribute('position');
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(wm);
        pts.push(v.x, v.y, v.z);
        box.expandByPoint(v);
      }
      eg.dispose();
    });
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    return { geom: g, center, size };
  }, [scene]);

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(NEON) },
          uActive: { value: 0 },
          uCenter: { value: center.clone() },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [center],
  );

  // Place the outline at the structure's authored transform.
  const { pos, quat, scl } = useMemo(() => {
    const m = unityTRS(a.transform, new Matrix4());
    const p = new Vector3();
    const q = new Quaternion();
    const s = new Vector3();
    m.decompose(p, q, s);
    return {
      pos: [p.x, p.y, p.z] as [number, number, number],
      quat: [q.x, q.y, q.z, q.w] as [number, number, number, number],
      scl: [s.x, s.y, s.z] as [number, number, number],
    };
  }, [a.transform]);

  useFrame((_, dt) => {
    const m = lineRef.current?.material as ShaderMaterial | undefined;
    if (!m) return;
    const u = m.uniforms;
    u.uTime.value += Math.min(dt, 0.1);
    // light up only as the walk reaches this stop (or on hover)
    const activeF = useSceneStore.getState().progress * (N - 1);
    const prox = 1 - smoothstep(0.4, 1.05, Math.abs(activeF - index));
    const target = Math.max(prox, hover ? 1 : 0);
    const prev = u.uActive.value;
    u.uActive.value += (target - prev) * Math.min(1, dt * 8);
    if (hover || Math.abs(target - u.uActive.value) > 0.01) invalidate();
  });

  return (
    <group position={pos} quaternion={quat} scale={scl}>
      <lineSegments ref={lineRef} geometry={geom} material={mat} frustumCulled={false} />
      <mesh
        position={[center.x, center.y, center.z]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          open(a.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
          invalidate();
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = 'auto';
          invalidate();
        }}
      >
        <boxGeometry args={[size.x, size.y, size.z]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function AttractionOutlines() {
  return (
    <>
      {ATTRACTIONS.map((a, i) => (
        <Outline key={a.id} a={a} index={i} />
      ))}
    </>
  );
}
