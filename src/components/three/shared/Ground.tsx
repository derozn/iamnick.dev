/**
 * Ground — the midway floor: a large dark base with a slightly lighter central
 * path strip running down the street, so the warm stall pools and lamp light
 * have something to fall on. Static, low-key; the fog swallows the far edges.
 */
export function Ground() {
  return (
    <group>
      {/* Base ground — grassy dark field, extends past the fog so there's no edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]} receiveShadow>
        <planeGeometry args={[120, 200]} />
        <meshStandardMaterial color="#1d2320" roughness={1} metalness={0} />
      </mesh>

      {/* Trodden dirt — the avenue + plaza floor, lighter so it picks up the warm light */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -10]}>
        <planeGeometry args={[10, 36]} />
        <meshStandardMaterial color="#2a2230" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -44]}>
        <circleGeometry args={[16, 40]} />
        <meshStandardMaterial color="#2a2230" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
