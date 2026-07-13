import { describe, expect, it } from 'vitest';
import { Matrix4, Quaternion, Vector3 } from 'three';

import { unityTRS } from './conversion';

/**
 * unityTRS is the coordinate convention EVERYTHING in the scene depends on — a
 * single flipped sign scrambles every prop's place silently. These lock the
 * left-handed-Unity → right-handed-three conversion: Z negates on position, the
 * quaternion converts (x,y negate; z,w hold), scale passes through.
 */
describe('unityTRS', () => {
  const decompose = (m: Matrix4) => {
    const p = new Vector3();
    const q = new Quaternion();
    const s = new Vector3();
    m.decompose(p, q, s);
    return { p, q, s };
  };

  it('negates Z on position, keeps X and Y', () => {
    const { p } = decompose(unityTRS([1, 2, 3, 0, 0, 0, 1, 1, 1, 1], new Matrix4()));
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(2);
    expect(p.z).toBeCloseTo(-3);
  });

  it('converts the quaternion (x,y flip; z,w hold)', () => {
    const { q } = decompose(unityTRS([0, 0, 0, 0.1, 0.2, 0.3, 0.9, 1, 1, 1], new Matrix4()));
    // three renormalises on compose/decompose, so compare direction not raw values.
    const expected = new Quaternion(-0.1, -0.2, 0.3, 0.9).normalize();
    expect(Math.abs(q.dot(expected))).toBeCloseTo(1);
  });

  it('passes scale through unchanged', () => {
    const { s } = decompose(unityTRS([0, 0, 0, 0, 0, 0, 1, 2, 3, 4], new Matrix4()));
    expect(s.x).toBeCloseTo(2);
    expect(s.y).toBeCloseTo(3);
    expect(s.z).toBeCloseTo(4);
  });

  it('writes into the provided out matrix and returns it', () => {
    const out = new Matrix4();
    const result = unityTRS([5, 0, 0, 0, 0, 0, 1, 1, 1, 1], out);
    expect(result).toBe(out);
    expect(decompose(out).p.x).toBeCloseTo(5);
  });
});
