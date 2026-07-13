import { Color, type Material, type MeshStandardMaterial, type Texture } from 'three';

const WHITE = new Color('#ffffff');

/** Wire the shared Synty emissive atlas onto a material so its neon pixels glow + bloom. */
export function applyEmissive(mat: Material | Material[], tex: Texture, intensity: number) {
  for (const m of Array.isArray(mat) ? mat : [mat]) {
    const sm = m as MeshStandardMaterial;
    if (!sm.emissiveMap) {
      sm.emissive = WHITE;
      sm.emissiveMap = tex;
      sm.emissiveIntensity = intensity;
      sm.needsUpdate = true;
    }
  }
}
