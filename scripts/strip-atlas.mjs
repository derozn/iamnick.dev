// Strip the embedded base-colour atlas from Synty GLBs that the runtime already
// re-textures with the shared external base-atlas.png (InstancedPrefab.applyBase
// with force=true). Each GLB ships its own ~0.6 MB copy of the same atlas — pure
// download waste once the runtime overrides it. ~17 MB → ~2 MB.
//
// KEPT untouched (their embedded texture is load-bearing):
//  - SHARE_SKIP prefabs (Sign_/Poster/Board/Photo/Spirit) — shareAtlas=false, so
//    the runtime only fills a MISSING map; their own art must stay (SyntyScene).
//  - the animated rides (Merry-Go-Round / Teacup / Swinging Chairs) — AnimatedRides
//    applies NO base atlas, so they render from their embedded textures.
//
// Only the base-colour texture is removed; emissive (glow) is left alone. Usage:
//   node scripts/strip-atlas.mjs <inDir> <outDir>
// Writes stripped GLBs to outDir and prints a size report; never mutates inDir.

import { readdir, mkdir, stat, copyFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import draco3d from 'draco3d';

const [, , IN_DIR = 'public/models/synty', OUT_DIR = '/tmp/synty-stripped'] = process.argv;

// Must mirror the runtime exactly (SyntyScene SHARE_SKIP + AnimatedRides SPINNERS).
const SHARE_SKIP = /Sign_|Poster|Board|Photo|Spirit/;
const SPINNERS = new Set([
  'SM_Prop_Merry_Go_Round_01',
  'SM_Prop_Teacup_Ride_01',
  'SM_Prop_Swinging_Chairs_01',
]);
const keepTextures = (name) => SHARE_SKIP.test(name) || SPINNERS.has(name);

// The Synty GLBs use EXT_texture_webp textures and mixed Meshopt/Draco geometry
// compression — register the extensions + both codec dependencies so
// gltf-transform can read the geometry and re-encode it (compressed) on write.
await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

await mkdir(OUT_DIR, { recursive: true });
const files = (await readdir(IN_DIR)).filter((f) => f.endsWith('.glb'));

let inTotal = 0;
let outTotal = 0;
let strippedCount = 0;
let keptCount = 0;

for (const file of files) {
  const name = basename(file, '.glb');
  const inPath = join(IN_DIR, file);
  const outPath = join(OUT_DIR, file);
  inTotal += (await stat(inPath)).size;

  if (keepTextures(name)) {
    // Raw byte-copy — never round-trip these through the (lossy) geometry
    // re-encode; their embedded textures are load-bearing.
    await copyFile(inPath, outPath);
    keptCount += 1;
    outTotal += (await stat(outPath)).size;
    continue;
  }

  {
    const doc = await io.read(inPath);
    // Detach the base-colour texture from every material; prune removes the now-
    // orphaned image. keepAttributes: the UV (TEXCOORD_0) is now unreferenced but
    // MUST stay — the runtime maps the shared atlas through it (without this,
    // prune drops the UVs and every stripped prop renders untextured/white).
    for (const mat of doc.getRoot().listMaterials()) {
      mat.setBaseColorTexture(null);
    }
    await doc.transform(prune({ keepAttributes: true }));
    await io.write(outPath, doc);
    strippedCount += 1;
  }
  outTotal += (await stat(outPath)).size;
}

console.log(`GLBs: ${files.length} (stripped ${strippedCount}, kept ${keptCount})`);
console.log(`total: ${kb(inTotal)} → ${kb(outTotal)}  (saved ${kb(inTotal - outTotal)})`);
