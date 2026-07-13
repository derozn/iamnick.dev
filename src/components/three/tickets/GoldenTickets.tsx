'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  DoubleSide,
  type Group,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
} from 'three';

import { useSceneStore } from '@/store/scene';
import { playSfx } from '@/lib/audio';
import { useDisposeOnUnmount } from '@/components/three/hooks/useDisposable';
import { getGlowTexture } from '@/components/three/shared/glowTexture';
import { ANIM_RANGE, BOB_AMP, BOB_HZ, SPIN, TICKETS } from './ticketConfig';

/**
 * GoldenTickets — the collectible hunt. Eight glowing golden tickets bob and
 * spin at landmarks around the map; clicking one punches it into the HUD tally
 * (store-persisted) with a confetti burst. Drives visitors to explore every
 * corner Bruno-style.
 *
 * Perf: one shared geometry + material across all tickets, an additive halo
 * sprite each (reads golden even without the bloom composer), an invisible
 * sphere as a fat hit target, and the bob/spin loop only invalidates while an
 * uncollected ticket is near the camera (demand-loop friendly).
 */

const _v = new Vector3();

export function GoldenTickets({ bloomOn = false }: { bloomOn?: boolean }) {
  const found = useSceneStore((s) => s.ticketsFound);
  const invalidate = useThree((s) => s.invalidate);
  const groupRefs = useRef<(Group | null)[]>([]);

  const geometry = useMemo(() => new PlaneGeometry(0.55, 0.3), []);
  const hitGeometry = useMemo(() => new SphereGeometry(0.5, 8, 8), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#caa64a',
        emissive: '#ffcf5e',
        // bloom supplies the glow when on; boosted to carry it alone when off
        emissiveIntensity: bloomOn ? 2.2 : 3.4,
        metalness: 0.4,
        roughness: 0.35,
        side: DoubleSide,
      }),
    [bloomOn],
  );
  // Disposed when the hunt ends (component unmounts) or the material rebuilds on
  // a bloom-tier change.
  useDisposeOnUnmount(geometry);
  useDisposeOnUnmount(hitGeometry);
  useDisposeOnUnmount(material);

  const remaining = useMemo(() => TICKETS.filter((t) => !found.includes(t.id)), [found]);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    let near = false;
    remaining.forEach((ticket, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      g.position.y = ticket.pos[1] + BOB_AMP * Math.sin(t * BOB_HZ * Math.PI * 2 * 0.16 + i * 1.37);
      g.rotation.y = t * SPIN + i * 0.9;
      if (!near && _v.set(...ticket.pos).distanceTo(camera.position) < ANIM_RANGE) near = true;
    });
    if (near) invalidate(); // keep bobbing while any ticket is in range
  });

  const collect = (id: string, pos: [number, number, number]) => {
    const st = useSceneStore.getState();
    // inert until the visitor is actually exploring
    if (!st.started || st.mode !== 'travelling') return false;
    st.collectTicket(id);
    st.fireBurst(pos);
    playSfx('punch');
    invalidate();
    return true;
  };

  return (
    <>
      {remaining.map((ticket, i) => (
        <group
          key={ticket.id}
          position={ticket.pos}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
        >
          <mesh geometry={geometry} material={material} />
          {/* additive halo so the gold reads at a distance without the composer */}
          <sprite scale={[1.5, 1.5, 1]}>
            <spriteMaterial
              map={getGlowTexture()}
              color="#ffcf5e"
              transparent
              opacity={bloomOn ? 0.3 : 0.55}
              blending={AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
          {/* fat invisible hit target — tickets are small and spinning */}
          <mesh
            geometry={hitGeometry}
            visible={false}
            onClick={(e) => {
              e.stopPropagation();
              // the ticket unmounts under the pointer — hand the cursor back
              if (collect(ticket.id, ticket.pos)) document.body.style.cursor = 'grab';
            }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'grab';
            }}
          />
        </group>
      ))}
    </>
  );
}
