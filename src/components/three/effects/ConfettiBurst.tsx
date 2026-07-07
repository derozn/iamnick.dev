'use client';

import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, DoubleSide, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';

import { useSceneStore } from '@/store/scene';

/**
 * ConfettiBurst — one pooled instanced mesh of tiny paper rectangles that
 * erupts wherever the store's `burst` trigger points (ticket punched, striker
 * bell rung). Deterministic hash-seeded velocities (no Math.random), gravity +
 * drag + tumble, dead particles collapse to zero scale. No composer dependency;
 * self-invalidates only while particles are alive.
 */

const COUNT = 110;
const LIFE = 1.6; // seconds
const GRAVITY = -4.2;
const DRAG = 0.985;
const COLORS = ['#ffd34d', '#c50201', '#22d3ee', '#e6dabd', '#b06cff'].map((c) => new Color(c));

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

const _m = new Matrix4();
const _q = new Quaternion();
const _axis = new Vector3();
const ZERO = new Matrix4().makeScale(0, 0, 0);

export function ConfettiBurst() {
  const mesh = useRef<InstancedMesh>(null);
  const invalidate = useThree((s) => s.invalidate);

  // simulation state in refs (never mutate hook returns in useFrame)
  const sim = useRef({
    seenSeq: 0,
    alive: false,
    age: 0,
    pos: new Float32Array(COUNT * 3),
    vel: new Float32Array(COUNT * 3),
    rotAxis: new Float32Array(COUNT * 3),
    rotSpeed: new Float32Array(COUNT),
  });

  // the pool starts dead — collapse every instance before first paint (a fresh
  // InstancedMesh defaults to identity matrices = a clump of visible quads)
  useLayoutEffect(() => {
    const im = mesh.current;
    if (!im) return;
    for (let i = 0; i < COUNT; i++) im.setMatrixAt(i, ZERO);
    im.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    const im = mesh.current;
    if (!im) return;
    const s = sim.current;
    const st = useSceneStore.getState();

    // new trigger? seed a burst at its position
    if (st.burst.seq !== s.seenSeq) {
      s.seenSeq = st.burst.seq;
      const [bx, by, bz] = st.burst.pos;
      for (let i = 0; i < COUNT; i++) {
        const h1 = hash(st.burst.seq * 997 + i);
        const h2 = hash(st.burst.seq * 641 + i * 7);
        const h3 = hash(st.burst.seq * 389 + i * 13);
        const ang = h1 * Math.PI * 2;
        const up = 2.2 + h2 * 2.6; // cone up
        const out = 0.6 + h3 * 1.7;
        s.pos[i * 3] = bx;
        s.pos[i * 3 + 1] = by;
        s.pos[i * 3 + 2] = bz;
        s.vel[i * 3] = Math.cos(ang) * out;
        s.vel[i * 3 + 1] = up;
        s.vel[i * 3 + 2] = Math.sin(ang) * out;
        s.rotAxis[i * 3] = h1 - 0.5;
        s.rotAxis[i * 3 + 1] = h2 - 0.5;
        s.rotAxis[i * 3 + 2] = h3 - 0.5;
        s.rotSpeed[i] = 6 + h2 * 10;
        im.setColorAt(i, COLORS[i % COLORS.length]);
      }
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      s.alive = true;
      s.age = 0;
    }

    if (!s.alive) return;
    const dt = Math.min(delta, 0.05);
    s.age += dt;
    if (s.age >= LIFE) {
      s.alive = false;
      for (let i = 0; i < COUNT; i++) im.setMatrixAt(i, ZERO);
      im.instanceMatrix.needsUpdate = true;
      invalidate();
      return;
    }

    const fade = 1 - s.age / LIFE;
    for (let i = 0; i < COUNT; i++) {
      s.vel[i * 3] *= DRAG;
      s.vel[i * 3 + 1] = s.vel[i * 3 + 1] * DRAG + GRAVITY * dt;
      s.vel[i * 3 + 2] *= DRAG;
      s.pos[i * 3] += s.vel[i * 3] * dt;
      s.pos[i * 3 + 1] += s.vel[i * 3 + 1] * dt;
      s.pos[i * 3 + 2] += s.vel[i * 3 + 2] * dt;
      _axis.set(s.rotAxis[i * 3], s.rotAxis[i * 3 + 1], s.rotAxis[i * 3 + 2]).normalize();
      _q.setFromAxisAngle(_axis, s.age * s.rotSpeed[i]);
      _m.makeRotationFromQuaternion(_q);
      const sc = fade; // shrink out as they die
      _m.elements[0] *= sc;
      _m.elements[1] *= sc;
      _m.elements[2] *= sc;
      _m.elements[4] *= sc;
      _m.elements[5] *= sc;
      _m.elements[6] *= sc;
      _m.elements[8] *= sc;
      _m.elements[9] *= sc;
      _m.elements[10] *= sc;
      _m.setPosition(s.pos[i * 3], s.pos[i * 3 + 1], s.pos[i * 3 + 2]);
      im.setMatrixAt(i, _m);
    }
    im.instanceMatrix.needsUpdate = true;
    invalidate(); // keep the demand loop fed while the burst lives
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.055, 0.038]} />
      <meshBasicMaterial toneMapped={false} side={DoubleSide} />
    </instancedMesh>
  );
}
