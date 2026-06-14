/**
 * Ground — the midway floor: a large dark base with a slightly lighter central
 * path strip running down the street, so the warm stall pools and lamp light
 * have something to fall on. Static, low-key; the fog swallows the far edges.
 */
export function Ground() {
  return (
    <group>
      {/* Base ground — extends well past the fog so there's no visible edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]} receiveShadow>
        <planeGeometry args={[60, 150]} />
        <meshStandardMaterial color="#13101d" roughness={1} metalness={0} />
      </mesh>

      {/* Worn central path — a touch lighter, picks up the lamp/stall light */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -25]} receiveShadow>
        <planeGeometry args={[8.5, 150]} />
        <meshStandardMaterial color="#1c1726" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
