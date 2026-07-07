'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  Box3,
  type Camera,
  DoubleSide,
  type Group,
  type InstancedMesh,
  Matrix4,
  type Mesh,
  type MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three';

import { BALL_TOSS_BALLS, useSceneStore } from '@/store/scene';
import { playSfx } from '@/lib/audio';
import {
  AIM_LOFT,
  AIM_YAW,
  ARC_SAMPLES,
  BOOTH_FOCUS,
  CASCADE_PUSH_FACTOR,
  CASCADE_RADIUS_FACTOR,
  CLEAR_COMBO_BONUS,
  CM,
  COMBO_MIN_HITS,
  FLOOR_Y,
  FORWARD,
  GRAVITY,
  HIT_DAMPING,
  HIT_FUDGE,
  KNOCK_PUSH,
  KNOCK_SPIN,
  KNOCK_UP,
  LAUNCH_DIST,
  LAUNCH_LIFT,
  MAX_RANGE,
  MAX_SPEED,
  MIN_SPEED,
  POINTS_PER_BOTTLE,
  POUCH_NDC,
  PULL_DEADZONE,
  PULL_FULL,
  PULL_WORLD,
  pyramidPositions,
  SETTLE_Y,
  SIDE,
  SYNTY,
} from './ballTossConfig';

/**
 * BallTossGame — the in-Canvas carnival ball-toss mini-game. Mounts inside the
 * scene's <Suspense> and self-gates on store state: it only renders while the
 * visitor has stepped into the ball-toss booth (`mode === 'playing'` and
 * `activeStall === 'ball-toss'`).
 *
 * Custom lightweight physics (no physics dep): the ball is a projectile under
 * gravity; bottles are sphere-vs-cylinder targets. The whole per-frame sim lives
 * in refs (R3F lint forbids mutating hook returns / reading ref.current in render);
 * only summary state (score / balls / phase) is mirrored to the store for the HUD.
 *
 * Controls — **slingshot** (one scheme, works on mouse + touch): a ready ball
 *   sits in the pouch; press and drag it *back* against where you want it to go,
 *   then release. Pull distance is power, pull direction is aim, and the ball
 *   fires opposite the pull. A live trajectory arc + reticle preview the shot as
 *   you drag; a tap (pull under PULL_DEADZONE) cancels without spending a ball.
 */

useGLTF.preload(`${SYNTY}SM_Prop_Milk_Bottle_01.glb`, true);
useGLTF.preload(`${SYNTY}SM_Prop_Baseball_01.glb`, true);

/** Strip the black COLOR_0 vertex colour so a cloned Synty prop lights normally. */
function unblacken(root: Group) {
  root.traverse((o) => {
    const m = o as Mesh;
    if (m.isMesh && m.material) {
      for (const mm of Array.isArray(m.material) ? m.material : [m.material]) {
        (mm as MeshStandardMaterial).vertexColors = false;
      }
    }
  });
}

/** A cloned, game-ready milk-bottle scene + its metrics (metres, after CM scale). */
function useBottleAsset() {
  const { scene } = useGLTF(`${SYNTY}SM_Prop_Milk_Bottle_01.glb`, true);
  return useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const height = size.y * CM;
    const radius = (Math.max(size.x, size.z) / 2) * CM;
    const baseY = box.min.y * CM; // bottle origin → base offset (≈0)
    // One clone per bottle (a <primitive> can't mount twice); 6 small meshes is fine.
    const clones = Array.from({ length: 6 }, () => {
      const c = scene.clone(true);
      unblacken(c);
      return c;
    });
    return { clones, height, radius, baseY };
  }, [scene]);
}

/** A cloned, game-ready ball + its radius (metres, after CM scale). */
function useBallAsset() {
  const { scene } = useGLTF(`${SYNTY}SM_Prop_Baseball_01.glb`, true);
  return useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const radius = (Math.max(size.x, size.y, size.z) / 2) * CM;
    const clone = scene.clone(true);
    unblacken(clone);
    return { clone, radius };
  }, [scene]);
}

export function BallTossGame() {
  const active = useSceneStore((s) => s.mode === 'playing' && s.activeStall === 'ball-toss');
  if (!active) return null;
  return <Sim />;
}

// Module-scope scratch — never allocate inside the per-frame sim.
const _v = new Vector3();
const _p = new Vector3();
const _vel = new Vector3();
const _kd = new Vector3();
const _cd = new Vector3();
const _m = new Matrix4();
const _dq = new Quaternion();
const _hidden = new Matrix4().makeScale(0, 0, 0);

/** Per-bottle rigid state. Standing bottles sit at `base`; a knock turns them into
 *  a tumbling body integrated under gravity until they fall out of play. */
interface BottleSim {
  base: Vector3;
  pos: Vector3;
  vel: Vector3;
  quat: Quaternion;
  axis: Vector3; // tumble axis (unit)
  spin: number; // tumble rate (rad/s)
  up: boolean; // still standing
  resting: boolean; // fallen and spent
}

function makeSims(positions: Vector3[]): BottleSim[] {
  return positions.map((base) => ({
    base,
    pos: base.clone(),
    vel: new Vector3(),
    quat: new Quaternion(),
    axis: new Vector3(1, 0, 0),
    spin: 0,
    up: true,
    resting: false,
  }));
}

const _up = new Vector3(0, 1, 0);

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** World point of the slingshot pouch — the ready-ball rest, LAUNCH_DIST in front
 *  of the camera at the POUCH_NDC screen anchor. */
function pouchPoint(camera: Camera, out: Vector3) {
  out
    .set(POUCH_NDC[0], POUCH_NDC[1], 0.5)
    .unproject(camera)
    .sub(camera.position)
    .normalize()
    .multiplyScalar(LAUNCH_DIST)
    .add(camera.position);
  return out;
}

/** Loaded-ball world position: the pouch drawn toward the finger by the pull
 *  (drag in screen NDC, y-up), so the ball visibly follows the drag. */
function loadedPoint(camera: Camera, dx: number, dy: number, out: Vector3) {
  pouchPoint(camera, out);
  out.addScaledVector(SIDE, dx * PULL_WORLD);
  out.addScaledVector(_up, dy * PULL_WORLD);
  return out;
}

/** Power [0..1] for a pull (drag in NDC): distance past the deadzone, up to PULL_FULL. */
function pullPower(dx: number, dy: number) {
  const len = Math.hypot(dx, dy);
  return clamp((len - PULL_DEADZONE) / (PULL_FULL - PULL_DEADZONE), 0, 1);
}

/** Launch direction for a pull (drag in NDC, y-up): forward into the booth, swung
 *  laterally *opposite* the pull and lofted up — a slingshot fires away from the draw. */
function launchDir(dx: number, dy: number, out: Vector3) {
  const yaw = clamp(-dx / PULL_FULL, -1, 1) * AIM_YAW;
  out.copy(FORWARD).setY(0).normalize().applyAxisAngle(_up, yaw);
  out.y += LAUNCH_LIFT + clamp(-dy / PULL_FULL, 0, 1) * AIM_LOFT;
  return out.normalize();
}

function Sim() {
  const { camera, gl, invalidate } = useThree();
  const { clones, height: bottleH, radius: bottleR, baseY } = useBottleAsset();
  const { clone: ballClone, radius: ballR } = useBallAsset();

  const setBallToss = useSceneStore((s) => s.setBallToss);
  const round = useSceneStore((s) => s.ballTossRound);
  const phase = useSceneStore((s) => s.ballTossPhase);

  // Resting upright base positions for the pyramid (world space).
  const positions = useMemo(
    () => pyramidPositions(bottleR * 2 + 0.012, bottleH * 0.96),
    [bottleR, bottleH],
  );

  const spacing = bottleR * 2 + 0.012;
  const cascadeRadius = spacing * CASCADE_RADIUS_FACTOR;

  // --- Sim state (refs only; mutated in handlers / useFrame) ---
  const bottleGroups = useRef<(Group | null)[]>([]);
  const sims = useRef<BottleSim[]>(makeSims(positions));
  const ball = useRef({ pos: new Vector3(), vel: new Vector3(), live: false });
  const ballGroup = useRef<Group>(null);
  // Slingshot pull, in screen NDC (y-up): anchor = where the drag began, drag =
  // current offset from it. Power and aim are both derived from `drag`.
  const pulling = useRef(false);
  const anchor = useRef({ x: 0, y: 0 });
  const drag = useRef({ x: 0, y: 0 });
  const knockedThisThrow = useRef(0);
  const arc = useRef<InstancedMesh>(null);
  const reticle = useRef<Mesh>(null);

  // Entering the booth (Sim mounts) opens the how-to card before play.
  useEffect(() => {
    setBallToss({ ballTossScore: 0, ballTossBallsLeft: BALL_TOSS_BALLS, ballTossPhase: 'intro' });
  }, [setBallToss]);

  // Demand frameloop only ticks on invalidate; nudge it on phase change so the
  // ready ball / aim preview appears the moment we enter (or re-enter) `aiming`.
  useEffect(() => {
    invalidate();
  }, [phase, invalidate]);

  // Rebuild the stack on mount and on every "Play again" (round bump): fresh sims
  // plus restored bottle visuals (upright, visible) since the sim mutates groups.
  useEffect(() => {
    sims.current = makeSims(positions);
    sims.current.forEach((s, i) => {
      const g = bottleGroups.current[i];
      if (g) {
        g.position.copy(s.base);
        g.quaternion.identity();
        g.visible = true;
      }
    });
    ball.current.live = false;
    if (ballGroup.current) ballGroup.current.visible = false;
    pulling.current = false;
    drag.current.x = 0;
    drag.current.y = 0;
    knockedThisThrow.current = 0;
    invalidate();
  }, [round, positions, invalidate]);

  // Slingshot: press to grab, drag back to aim + load power, release to throw.
  useEffect(() => {
    const el = gl.domElement;
    const toNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -(((e.clientY - r.top) / r.height) * 2 - 1),
      };
    };
    const canThrow = () => {
      const s = useSceneStore.getState();
      return s.ballTossPhase === 'aiming' && s.ballTossBallsLeft > 0;
    };
    const onDown = (e: PointerEvent) => {
      if (!canThrow()) return;
      anchor.current = toNdc(e);
      drag.current.x = 0;
      drag.current.y = 0;
      pulling.current = true;
      invalidate();
    };
    const onMove = (e: PointerEvent) => {
      if (!pulling.current) return;
      const n = toNdc(e);
      drag.current.x = n.x - anchor.current.x;
      drag.current.y = n.y - anchor.current.y;
      invalidate();
    };
    const onUp = () => {
      if (!pulling.current) return;
      pulling.current = false;
      const dx = drag.current.x;
      const dy = drag.current.y;
      drag.current.x = 0;
      drag.current.y = 0;
      // A tap (no real pull) cancels — no ball spent.
      if (!canThrow() || Math.hypot(dx, dy) < PULL_DEADZONE) {
        invalidate();
        return;
      }
      const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * pullPower(dx, dy);
      loadedPoint(camera, dx, dy, ball.current.pos); // fires from the drawn-back ball
      ball.current.vel.copy(launchDir(dx, dy, _v)).multiplyScalar(speed);
      ball.current.live = true;
      knockedThisThrow.current = 0;
      if (ballGroup.current) ballGroup.current.visible = true;
      playSfx('throw');
      const s = useSceneStore.getState();
      s.setBallToss({ ballTossPhase: 'thrown', ballTossBallsLeft: s.ballTossBallsLeft - 1 });
      invalidate();
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [camera, gl, invalidate]);

  /** Trace the projectile from the drawn-back ball and lay the preview arc + reticle
   *  on it — the live picture of the current pull's power and aim. */
  function updateAim() {
    const dx = drag.current.x;
    const dy = drag.current.y;
    const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * pullPower(dx, dy);
    loadedPoint(camera, dx, dy, _p);
    _vel.copy(launchDir(dx, dy, _v)).multiplyScalar(speed);
    const step = 0.045;
    let landed = false;
    for (let i = 0; i < ARC_SAMPLES; i++) {
      if (!landed) {
        _m.makeTranslation(_p.x, _p.y, _p.z);
        arc.current?.setMatrixAt(i, _m);
        if (reticle.current && _p.y <= BOOTH_FOCUS.y) {
          reticle.current.position.copy(_p);
          landed = true;
        }
        _vel.y += GRAVITY * step;
        _p.addScaledVector(_vel, step);
      } else {
        arc.current?.setMatrixAt(i, _hidden);
      }
    }
    if (arc.current) arc.current.instanceMatrix.needsUpdate = true;
  }

  /** Integrate the ball, resolve bottle hits, retire it when done. Substepped at a
   *  fixed small h so a fast ball can't tunnel through the thin bottle volume. */
  function stepBall(dt: number) {
    const b = ball.current;
    const H = 0.004; // ≈1.6cm/step at 4 m/s — well under the ~12cm hit radius
    let remaining = dt;
    while (remaining > 0 && b.live) {
      const h = Math.min(H, remaining);
      remaining -= h;
      b.vel.y += GRAVITY * h;
      b.pos.addScaledVector(b.vel, h);

      const rr = bottleR + ballR + HIT_FUDGE;
      for (let i = 0; i < sims.current.length; i++) {
        const s = sims.current[i];
        if (!s.up) continue;
        const dx = b.pos.x - s.base.x;
        const dz = b.pos.z - s.base.z;
        const lo = s.base.y - ballR - HIT_FUDGE;
        const hi = s.base.y + bottleH + ballR + HIT_FUDGE;
        const withinY = b.pos.y > lo && b.pos.y < hi;
        if (withinY && dx * dx + dz * dz < rr * rr) {
          knock(i, _kd.copy(b.vel), false);
          b.vel.multiplyScalar(HIT_DAMPING);
        }
      }

      if (b.pos.y < FLOOR_Y || b.pos.distanceTo(BOOTH_FOCUS) > MAX_RANGE) {
        retireBall();
        return;
      }
    }
    if (ballGroup.current) ballGroup.current.position.copy(b.pos);
  }

  /** Topple a bottle along `dir`: impulse + tumble, score it, and cascade into any
   *  standing neighbours it would fall onto. */
  function knock(i: number, dir: Vector3, cascade: boolean) {
    const s = sims.current[i];
    if (!s.up) return;
    s.up = false;
    knockedThisThrow.current++;
    playSfx('bottle'); // throttled in the mixer, so a cascade doesn't machine-gun

    // Horizontal shove along the incoming direction (default forward if degenerate).
    _kd.copy(dir).setY(0);
    if (_kd.lengthSq() < 1e-6) _kd.set(0, 0, -1);
    _kd.normalize();
    const push = (cascade ? CASCADE_PUSH_FACTOR : 1) * KNOCK_PUSH;
    s.vel.copy(_kd).multiplyScalar(push).setY(KNOCK_UP);
    // Tumble about the horizontal axis perpendicular to the shove (falls forward).
    s.axis.set(_kd.z, 0, -_kd.x).normalize();
    // Deterministic per-bottle variation (no Math.random — keeps the sim pure/repeatable).
    s.spin = KNOCK_SPIN * (0.85 + 0.3 * ((i % 4) / 3));
    // Capture the fall direction before recursion clobbers the shared scratch.
    const fallX = _kd.x;
    const fallZ = _kd.z;

    const st = useSceneStore.getState();
    st.setBallToss({ ballTossScore: st.ballTossScore + POINTS_PER_BOTTLE });

    // Cascade: only nudge near neighbours the bottle actually falls *onto* (ahead in
    // the fall direction), so a hit topples a fan — not the whole connected stack.
    for (let j = 0; j < sims.current.length; j++) {
      const n = sims.current[j];
      if (j === i || !n.up) continue;
      const dx = n.base.x - s.base.x;
      const dz = n.base.z - s.base.z;
      if (dx * dx + dz * dz < cascadeRadius * cascadeRadius && dx * fallX + dz * fallZ > 0) {
        knock(j, _cd.set(dx, 0, dz), true);
      }
    }
  }

  /** Ball is spent — hide it, award any combo, advance the round (next / won / lost). */
  function retireBall() {
    ball.current.live = false;
    if (ballGroup.current) ballGroup.current.visible = false;
    const s = useSceneStore.getState();
    if (knockedThisThrow.current >= COMBO_MIN_HITS) {
      s.setBallToss({ ballTossScore: s.ballTossScore + CLEAR_COMBO_BONUS });
    }
    const standing = sims.current.filter((b) => b.up).length;
    if (standing === 0) s.setBallToss({ ballTossPhase: 'won' });
    else if (s.ballTossBallsLeft <= 0) s.setBallToss({ ballTossPhase: 'lost' });
    else s.setBallToss({ ballTossPhase: 'aiming' });
    invalidate();
  }

  /** Integrate any toppling bottles; returns true while some are still moving. */
  function stepBottles(dt: number) {
    let moving = false;
    for (let i = 0; i < sims.current.length; i++) {
      const s = sims.current[i];
      if (s.up || s.resting) continue;
      moving = true;
      s.vel.y += GRAVITY * dt;
      s.pos.addScaledVector(s.vel, dt);
      _dq.setFromAxisAngle(s.axis, s.spin * dt);
      s.quat.premultiply(_dq);
      const g = bottleGroups.current[i];
      if (s.pos.y < SETTLE_Y) {
        s.resting = true;
        if (g) g.visible = false;
      } else if (g) {
        g.position.copy(s.pos);
        g.quaternion.copy(s.quat);
      }
    }
    return moving;
  }

  useFrame((_s, delta) => {
    const dt = Math.min(delta, 0.033);
    const aiming = useSceneStore.getState().ballTossPhase === 'aiming';
    const isPulling = pulling.current;

    // Aim preview (arc + reticle) shows only while actively drawing the slingshot.
    if (arc.current) arc.current.visible = aiming && isPulling;
    if (reticle.current) reticle.current.visible = aiming && isPulling;

    // Ready ball: rests in the pouch while aiming, follows the finger while pulling.
    if (aiming && !ball.current.live && ballGroup.current) {
      ballGroup.current.visible = true;
      if (isPulling) loadedPoint(camera, drag.current.x, drag.current.y, _p);
      else pouchPoint(camera, _p);
      ballGroup.current.position.copy(_p);
      if (isPulling) updateAim();
    }

    if (ball.current.live) {
      stepBall(dt);
      invalidate();
    }

    if (stepBottles(dt)) invalidate();
  });

  return (
    <group>
      {positions.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            bottleGroups.current[i] = el;
          }}
          position={p}
        >
          <group position={[0, -baseY, 0]} scale={CM}>
            <primitive object={clones[i]} />
          </group>
        </group>
      ))}

      {/* The thrown ball */}
      <group ref={ballGroup} visible={false}>
        <group scale={CM}>
          <primitive object={ballClone} />
        </group>
      </group>

      {/* Aim preview — trajectory dots + landing reticle (unlit, glowy) */}
      <instancedMesh ref={arc} args={[undefined, undefined, ARC_SAMPLES]} visible={false}>
        <sphereGeometry args={[0.022, 6, 6]} />
        <meshBasicMaterial color="#ffd34d" transparent opacity={0.85} depthWrite={false} />
      </instancedMesh>
      <mesh ref={reticle} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.07, 0.11, 24]} />
        <meshBasicMaterial
          color="#ffd34d"
          transparent
          opacity={0.9}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
