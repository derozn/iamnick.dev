'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  AdditiveBlending,
  Box3,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Matrix3,
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
 * AttractionOutlines — the clickable affordance. Each interactive structure is
 * wrapped in a **neon glow** that hugs its silhouette (fresnel rim) with a bright
 * point sweeping around it — the 3-D cousin of the HUD's rotating border beam. It's
 * an additive overlay on a slightly inflated copy of the model, so the original
 * model underneath is untouched; an invisible box takes the click/hover.
 *
 * Only the stop the walk is currently at lights up (progress-gated), and the glow
 * mesh is hidden entirely when dark, so just one ever draws.
 */

const cmScale = new Matrix4().makeScale(CM, CM, CM);
const NEON = '#ff2d3a';

const VERT = /* glsl */ `
  uniform vec3 uCenter;
  uniform float uInflate;
  varying vec3 vN;
  varying vec3 vView;
  varying float vAngle;
  void main() {
    vec3 p = position + normal * uInflate;       // thin halo just outside the model
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = normalize(-mv.xyz);
    vN = normalize(normalMatrix * normal);
    vec3 d = position - uCenter;
    vAngle = atan(d.x, d.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uActive; // master visibility 0..1 (only the current stop lights up)
  uniform vec3 uColor;
  varying vec3 vN;
  varying vec3 vView;
  varying float vAngle;
  void main() {
    float fres = pow(1.0 - max(dot(vN, vView), 0.0), 2.5);   // glow at the silhouette
    float beam = pow(0.5 + 0.5 * sin(vAngle - uTime * 2.0), 4.0); // bright point orbiting
    float i = uActive * fres * (0.9 + beam * 2.2);
    gl_FragColor = vec4(uColor * i, i);
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
  const glowRef = useRef<Mesh>(null);

  // Bake the prefab's triangles (position + normal) into its local cm-space, the
  // same space InstancedPrefab renders the real model in, so the glow aligns.
  const { geom, center, size } = useMemo(() => {
    scene.updateWorldMatrix(true, true);
    const P: number[] = [];
    const Nr: number[] = [];
    const box = new Box3();
    const v = new Vector3();
    const nv = new Vector3();
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh || !m.geometry) return;
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      const wm = new Matrix4().multiplyMatrices(cmScale, m.matrixWorld);
      const nm = new Matrix3().getNormalMatrix(wm);
      const pos = g.getAttribute('position');
      const nor = g.getAttribute('normal');
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(wm);
        P.push(v.x, v.y, v.z);
        box.expandByPoint(v);
        if (nor) {
          nv.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
          Nr.push(nv.x, nv.y, nv.z);
        } else {
          Nr.push(0, 1, 0);
        }
      }
      g.dispose();
    });
    const geom = new BufferGeometry();
    geom.setAttribute('position', new Float32BufferAttribute(P, 3));
    geom.setAttribute('normal', new Float32BufferAttribute(Nr, 3));
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    return { geom, center, size };
  }, [scene]);

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uActive: { value: 0 },
          uColor: { value: new Color(NEON) },
          uCenter: { value: center.clone() },
          uInflate: { value: Math.min(0.06, Math.max(size.x, size.y, size.z) * 0.012) },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [center, size],
  );

  // Place the glow at the structure's authored transform.
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
    const glow = glowRef.current;
    if (!glow) return;
    const u = (glow.material as ShaderMaterial).uniforms;
    u.uTime.value += Math.min(dt, 0.1);
    // light up only as the walk reaches this stop (or on hover)
    const activeF = useSceneStore.getState().progress * (N - 1);
    const prox = 1 - smoothstep(0.4, 1.05, Math.abs(activeF - index));
    const target = Math.max(prox, hover ? 1 : 0);
    u.uActive.value += (target - u.uActive.value) * Math.min(1, dt * 8);
    glow.visible = u.uActive.value > 0.01; // skip drawing dark glows
    if (hover || Math.abs(target - u.uActive.value) > 0.01) invalidate();
  });

  return (
    <group position={pos} quaternion={quat} scale={scl}>
      <mesh ref={glowRef} geometry={geom} material={mat} frustumCulled={false} visible={false} />
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
