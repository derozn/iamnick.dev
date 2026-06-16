'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import {
  Color,
  type Group,
  type Material,
  Matrix4,
  type Mesh,
  type MeshStandardMaterial,
  Quaternion,
  SRGBColorSpace,
  type Texture,
  Vector3,
} from 'three';

import demoInstances from './demo-instances.json';
import { CM, unityTRS } from './conversion';

/**
 * AnimatedRides — brings the carnival to life. The vertical-axis rides (carousel,
 * teacup, swing chairs) are pulled out of the static instanced scene and spun
 * around their centre, like the Unity demo's rotate scripts. Speed ramps with how
 * close the camera is, so a ride "comes to life" as you walk up to it and idles
 * when far — which also keeps the demand frameloop quiet most of the time.
 */

const data = demoInstances as Record<string, number[][]>;
const WHITE = new Color('#ffffff');
const SYNTY = '/models/synty/';

/** Prefabs whose whole model spins about Y (their base sits on the axis). */
export const SPINNERS = [
  { prefab: 'SM_Prop_Merry_Go_Round_01', speed: 0.45 },
  { prefab: 'SM_Prop_Teacup_Ride_01', speed: 0.85 },
  { prefab: 'SM_Prop_Swinging_Chairs_01', speed: 0.55 },
];
export const SPINNER_NAMES = new Set(SPINNERS.map((s) => s.prefab));

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function applyEmissive(mat: Material | Material[], tex: Texture) {
  for (const m of Array.isArray(mat) ? mat : [mat]) {
    const sm = m as MeshStandardMaterial;
    if (!sm.emissiveMap) {
      sm.emissive = WHITE;
      sm.emissiveMap = tex;
      sm.emissiveIntensity = 2;
      sm.needsUpdate = true;
    }
  }
}

function Ride({ prefab, speed, emissive }: { prefab: string; speed: number; emissive: Texture }) {
  const { scene } = useGLTF(`${SYNTY}${prefab}.glb`, true);
  const invalidate = useThree((s) => s.invalidate);
  const spin = useRef<Group>(null);

  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh && m.material) applyEmissive(m.material, emissive);
    });
    return c;
  }, [scene, emissive]);

  const { pos, quat, scl, origin } = useMemo(() => {
    const m = unityTRS(data[prefab][0], new Matrix4());
    const p = new Vector3();
    const q = new Quaternion();
    const s = new Vector3();
    m.decompose(p, q, s);
    return {
      pos: [p.x, p.y, p.z] as [number, number, number],
      quat: [q.x, q.y, q.z, q.w] as [number, number, number, number],
      scl: [s.x, s.y, s.z] as [number, number, number],
      origin: p.clone(),
    };
  }, [prefab]);

  useFrame(({ camera }, dt) => {
    if (!spin.current) return;
    const ramp = 1 - smoothstep(16, 40, camera.position.distanceTo(origin));
    if (ramp <= 0.001) return; // idle when far — no render churn
    spin.current.rotation.y += speed * ramp * Math.min(dt, 0.1);
    invalidate();
  });

  return (
    <group position={pos} quaternion={quat} scale={scl}>
      <group ref={spin}>
        <group scale={[CM, CM, CM]}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  );
}

export function AnimatedRides() {
  const emissive = useTexture(`${SYNTY}emissive-atlas.png`, (t) => {
    const tex = t as Texture;
    tex.flipY = false;
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
  }) as Texture;

  return (
    <>
      {SPINNERS.map((s) => (
        <Ride key={s.prefab} prefab={s.prefab} speed={s.speed} emissive={emissive} />
      ))}
    </>
  );
}
