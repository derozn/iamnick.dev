'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, type Group, type Sprite } from 'three';

import { useSceneStore } from '@/store/scene';
import { playSfx } from '@/lib/audio';
import { getGlowTexture } from '@/components/three/shared/glowTexture';
import {
  FALL_G,
  HOLD_TIME,
  meterValue,
  PERFECT,
  POLE_TOP_Y,
  PUCK_OFFSET,
  PUCK_START_Y,
  puckApex,
  REARM_DELAY,
  RISE_TIME,
  STRIKER_BASE,
} from './highStrikerConfig';

/**
 * HighStrikerGame — the in-canvas half of the strength test at the
 * SM_Prop_High_Striker_01 pole. Pure timing, no physics engine:
 *
 *   armed  — the HUD needle sweeps (both it and the tap read the same
 *            deterministic meterValue, so the hit is exactly what you saw);
 *            a pointerdown captures power and spends a swing.
 *   struck — the gold puck rides the pole: eased rise to the power's apex,
 *            a beat at the top (bell flash + confetti + ding on a PERFECT),
 *            then gravity brings it home.
 *   result — brief beat, then re-arm or finish the round (HUD shows verdict).
 *
 * The puck sim lives in refs; only phase summaries touch the store. Invalidates
 * while animating so the low tier's demand loop plays it smoothly.
 */

const PUCK_POS: [number, number, number] = [
  STRIKER_BASE[0] + PUCK_OFFSET[0],
  PUCK_START_Y,
  STRIKER_BASE[2] + PUCK_OFFSET[2],
];
const BELL_POS: [number, number, number] = [PUCK_POS[0], POLE_TOP_Y + 0.15, PUCK_POS[2]];

export function HighStrikerGame() {
  const active = useSceneStore((s) => s.mode === 'playing' && s.activeStall === 'high-striker');
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  const puck = useRef<Group>(null);
  const bellFlash = useRef<Sprite>(null);
  // swing sim (refs only): t = seconds since strike, rang = bell already fired
  const swing = useRef({ t: 0, apex: PUCK_START_Y, rang: false, settled: 0 });

  // Arm-phase input: a tap captures the needle. Listens on the canvas so HUD
  // buttons stay clickable (they're DOM, above the canvas).
  useEffect(() => {
    if (!active) return;
    const el = gl.domElement;
    const onDown = () => {
      const st = useSceneStore.getState();
      if (st.strikerPhase !== 'armed') return;
      const power = meterValue(performance.now() - st.strikerArmedAt);
      swing.current = { t: 0, apex: puckApex(power), rang: false, settled: 0 };
      playSfx('whoosh');
      st.setStriker({
        strikerPhase: 'struck',
        strikerPower: power,
        strikerAttemptsLeft: st.strikerAttemptsLeft - 1,
        strikerBest: Math.max(st.strikerBest, power),
      });
      invalidate();
    };
    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, [active, gl, invalidate]);

  // Reset the puck when stepping in / replaying.
  const round = useSceneStore((s) => s.strikerRound);
  useEffect(() => {
    if (puck.current) puck.current.position.y = PUCK_START_Y;
    swing.current = { t: 0, apex: PUCK_START_Y, rang: false, settled: 0 };
    invalidate();
  }, [active, round, invalidate]);

  useFrame((_, delta) => {
    if (!active) return;
    const st = useSceneStore.getState();
    const p = puck.current;
    const flash = bellFlash.current;
    if (!p) return;
    const dt = Math.min(delta, 0.05);
    const s = swing.current;

    if (st.strikerPhase === 'struck') {
      s.t += dt;
      const rise = s.apex - PUCK_START_Y;
      if (s.t <= RISE_TIME) {
        // eased rise (decelerating into the apex)
        const k = s.t / RISE_TIME;
        p.position.y = PUCK_START_Y + rise * (1 - (1 - k) * (1 - k));
      } else if (s.t <= RISE_TIME + HOLD_TIME) {
        p.position.y = s.apex;
        if (!s.rang && st.strikerPower >= PERFECT) {
          s.rang = true;
          playSfx('bell');
          st.fireBurst(BELL_POS);
          if (flash) flash.material.opacity = 1;
        }
      } else {
        // gravity home
        const tf = s.t - RISE_TIME - HOLD_TIME;
        const y = s.apex + 0.5 * FALL_G * tf * tf;
        p.position.y = Math.max(PUCK_START_Y, y);
        if (y <= PUCK_START_Y) {
          st.setStriker({ strikerPhase: 'result' });
          s.settled = 0;
        }
      }
      invalidate();
    } else if (st.strikerPhase === 'result') {
      s.settled += dt;
      if (s.settled >= REARM_DELAY) {
        if (st.strikerAttemptsLeft > 0) {
          st.setStriker({ strikerPhase: 'armed', strikerArmedAt: performance.now() });
        } else {
          st.setStriker({ strikerPhase: 'done' });
        }
      }
      invalidate();
    }

    // bell flash decays whenever lit
    if (flash && flash.material.opacity > 0) {
      flash.material.opacity = Math.max(0, flash.material.opacity - dt * 1.6);
      invalidate();
    }
  });

  if (!active) return null;
  return (
    <>
      {/* the striker puck riding the pole */}
      <group ref={puck} position={PUCK_POS}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.12, 16]} />
          <meshStandardMaterial
            color="#caa64a"
            emissive="#ffcf5e"
            emissiveIntensity={2.4}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>
      {/* bell flash on a perfect hit */}
      <sprite ref={bellFlash} position={BELL_POS} scale={[2.6, 2.6, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color="#fff3c0"
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </>
  );
}
