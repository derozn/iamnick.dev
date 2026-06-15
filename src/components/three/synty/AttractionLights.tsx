import { ATTRACTIONS } from './attractions';

/**
 * AttractionLights — a warm pool at each attraction structure so the tent the
 * camera stops at always glows (the demo's own light props are clustered near the
 * core, leaving the career row + back attractions dark otherwise).
 */
export function AttractionLights() {
  return (
    <>
      {ATTRACTIONS.map((a) => (
        <pointLight
          key={a.id}
          position={[a.look[0], a.look[1] + 2.6, a.look[2]]}
          color="#ff9a3c"
          intensity={11}
          distance={11}
          decay={2}
        />
      ))}
    </>
  );
}
