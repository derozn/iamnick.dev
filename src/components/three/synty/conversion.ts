import { Matrix4, Quaternion, Vector3 } from 'three';

/**
 * Unity → three.js coordinate conversion for the translated Synty Demo scene.
 *
 * The GLBs are assimp-converted from the same FBX the Unity prefabs use, so they
 * sit in glTF space already; only the per-instance transforms (read from the
 * Unity scene) need converting. Unity is left-handed, Y-up, +Z forward; three is
 * right-handed, Y-up, −Z forward → flip Z on position and convert the quaternion.
 * The cm→m factor (assimp keeps FBX centimetres) is baked per-mesh in
 * InstancedPrefab, not here.
 *
 * `FLIP`/`BASE_Y` are kept as knobs because the assimp-vs-Unity import handedness
 * was calibrated against a top-down render of the demo.
 */

export const CM = 0.01;

const _p = new Vector3();
const _q = new Quaternion();
const _s = new Vector3();

/** Build the three.js instance matrix from a Unity TRS tuple [px,py,pz, qx,qy,qz,qw, sx,sy,sz]. */
export function unityTRS(t: number[], out: Matrix4): Matrix4 {
  _p.set(t[0], t[1], -t[2]);
  _q.set(-t[3], -t[4], t[5], t[6]);
  _s.set(t[7], t[8], t[9]);
  return out.compose(_p, _q, _s);
}
