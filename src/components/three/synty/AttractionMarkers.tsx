'use client';

import { useState } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { type ThreeEvent } from '@react-three/fiber';

import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS, type Attraction } from './attractions';

/**
 * AttractionMarkers — a clickable, glowing brand-red marker floating over each
 * content tent. Billboarded so it always faces the camera; clicking opens that
 * section's HUD panel (sets the scene store to `viewing`). Bloom makes it glow.
 */
function Marker({ a }: { a: Attraction }) {
  const [hover, setHover] = useState(false);
  const open = useSceneStore((s) => s.open);

  return (
    <Billboard position={a.position}>
      <group
        scale={hover ? 1.18 : 1}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          open(a.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* dark disc so the icon reads against the scene */}
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[0.5, 40]} />
          <meshBasicMaterial color="#180407" transparent opacity={0.72} toneMapped={false} />
        </mesh>
        {/* glowing ring */}
        <mesh>
          <ringGeometry args={[0.5, 0.66, 40]} />
          <meshBasicMaterial color={hover ? '#ff4d4d' : '#c50201'} toneMapped={false} />
        </mesh>
        <Text
          position={[0, 0.02, 0.01]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ▶
        </Text>
        <Text
          position={[0, -1.05, 0]}
          fontSize={0.36}
          color="#ffe2e2"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.022}
          outlineColor="#160305"
        >
          {a.title}
        </Text>
      </group>
    </Billboard>
  );
}

export function AttractionMarkers() {
  return (
    <>
      {ATTRACTIONS.map((a) => (
        <Marker key={a.id} a={a} />
      ))}
    </>
  );
}
