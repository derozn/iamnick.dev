import { Matrix4, type Mesh, type Object3D, Vector3 } from 'three';

/**
 * Bulb-glow extraction — gives the carnival its night-time halos WITHOUT a
 * full-screen Bloom pass (the EffectComposer was the source of the black flicker).
 *
 * The Synty emissive atlas is 99% black with the bulb/light swatches packed into a
 * tiny lit corner, so any mesh vertex whose UV lands on a lit texel is, by
 * construction, a bulb. We sample the emissive image per vertex, collect those
 * points, and render them as additive billboard sprites (a soft radial gradient) —
 * cheap, self-illuminated halos that bloom visually without any post-processing.
 */

const CM = 0.01;

/** Sample the emissive atlas: returns the lit colour at (u,v), or null if dark. */
export type Sampler = (u: number, v: number) => [number, number, number] | null;

export function makeSampler(image: CanvasImageSource & { width: number; height: number }): Sampler {
  const w = image.width;
  const h = image.height;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  return (u, v) => {
    // flipY=false on the texture → UV v=0 is the first pixel row (top of image).
    let x = Math.floor(u * w);
    let y = Math.floor(v * h);
    x = ((x % w) + w) % w;
    y = ((y % h) + h) % h;
    const i = (y * w + x) * 4;
    const r = data[i];
    const gg = data[i + 1];
    const b = data[i + 2];
    if (r + gg + b < 60) return null; // dark → not a bulb
    return [r / 255, gg / 255, b / 255];
  };
}

const _base = new Matrix4();
const _v = new Vector3();

/**
 * Walk a prefab's meshes and collect every bulb vertex (UV hits a lit emissive
 * texel). Positions are returned in the prefab's **raw mesh space** (i.e. before the
 * cm→m scale and before the per-instance transform), de-duplicated to a ~2cm grid so
 * a single bulb's cluster of verts collapses to a few overlapping sprites.
 */
export function extractBulbs(
  root: Object3D,
  sample: Sampler,
): { positions: Float32Array; colors: Float32Array } {
  root.updateWorldMatrix(true, true);
  const pts: number[] = [];
  const cols: number[] = [];
  const seen = new Set<string>();
  root.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh || !m.geometry) return;
    const pos = m.geometry.attributes.position;
    const uv = m.geometry.attributes.uv;
    if (!pos || !uv) return;
    _base.copy(m.matrixWorld);
    for (let i = 0; i < pos.count; i++) {
      const col = sample(uv.getX(i), uv.getY(i));
      if (!col) continue;
      _v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(_base);
      const key = `${Math.round(_v.x / 2)},${Math.round(_v.y / 2)},${Math.round(_v.z / 2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pts.push(_v.x, _v.y, _v.z);
      cols.push(col[0], col[1], col[2]);
    }
  });
  return { positions: new Float32Array(pts), colors: new Float32Array(cols) };
}

/** cm-scale matrix shared by callers that place glow points in world space. */
export const CM_SCALE = new Matrix4().makeScale(CM, CM, CM);
