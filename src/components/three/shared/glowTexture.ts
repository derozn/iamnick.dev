import { CanvasTexture, SRGBColorSpace } from 'three';

/**
 * A soft white radial-gradient sprite — the shared halo shape, tinted per use.
 * Built once and cached. Lives in `three/shared/` because it's a generic glow
 * used by bulbs, the moon, golden tickets and the high-striker, not part of the
 * Synty translation layer where it originally sat.
 */
let glowTex: CanvasTexture | null = null;

export function getGlowTexture(): CanvasTexture {
  if (glowTex) return glowTex;
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  glowTex = new CanvasTexture(c);
  glowTex.colorSpace = SRGBColorSpace;
  return glowTex;
}
