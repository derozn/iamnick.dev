/**
 * SceneLighting — ambient base + sparse coloured point lights staggered along
 * the journey path (which descends from y 0 / z 0 to y -6.2 / z -35).
 */
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 6]} intensity={0.6} color="#bcd3ff" />

      {/* Cool accent / warm counterpoint pools along the path */}
      <pointLight position={[2.5, 1, -4]} intensity={5} distance={9} color="#4cc9f0" />
      <pointLight position={[-3, -1.2, -11]} intensity={5} distance={9} color="#ff5e87" />
      <pointLight position={[2.5, -2.2, -16]} intensity={5} distance={9} color="#4cc9f0" />
      <pointLight position={[-1.5, -4, -24]} intensity={5} distance={10} color="#b388ff" />
      <pointLight position={[0.5, -5.5, -33]} intensity={5} distance={10} color="#4cc9f0" />
    </>
  );
}
