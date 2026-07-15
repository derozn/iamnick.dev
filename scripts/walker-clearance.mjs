// Walker-path clearance check — the verification half of "tune the waypoints
// if a walker clips a tent or ride" (Npcs.tsx). Samples each walker loop in
// scenePlacements.json (closed centripetal Catmull-Rom, same as the runtime)
// and reports every solid prop instance the path passes through, using rough
// per-prefab footprint radii. Ground cover (grass, flowers, decals) and
// overhead pieces (tree canopies) are walkable and skipped.
//
//   node scripts/walker-clearance.mjs                 # check scenePlacements.json
//   node scripts/walker-clearance.mjs candidates.json # check a JSON array of [x,z][] loops
//
// Exit code 1 on any violation, so it can gate a tuning session.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { CatmullRomCurve3, Vector3 } from 'three';

const SYNTY = join(dirname(fileURLToPath(import.meta.url)), '../src/components/three/synty');
const demo = JSON.parse(readFileSync(join(SYNTY, 'demo-instances.json'), 'utf8'));

// Walkable ground cover — a walker brushing these reads fine.
const SOFT = /Decal|Grass|Flowers|Ground|Road|Dust|Leaves|Path|Puddle/i;
// Approximate solid footprint radii (m) by prefab name; default 0.6.
const RADII = [
  [/Bouncy_Castle/i, 2.6],
  [/Dunk_Tank/i, 1.4],
  [/Wagon/i, 1.6],
  [/Tent|Stall|Ride|Wheel|Arena|Castle|Tower/i, 3.0],
  [/Bld_Rail|Bld_Skirt|Bld_Support|Bld_Base|Bld_Stairs/i, 1.2],
  [/Photo_Stand/i, 0.9],
  [/Hay_Bale/i, 0.8],
  [/Barricade/i, 0.9],
  [/Bin|Can_/i, 0.5],
  [/Milkshake|Papers|Skull|Pumpkin|Monkey|Rubbish_Pile/i, 0.3],
  [/BearTrap/i, 0.5],
  [/Rocks_Small/i, 0.45],
  [/Bush/i, 0.6],
  [/Sunflower/i, 0.35],
  [/Balloon/i, 0.3],
  [/Tree|Env_Leaves_0/i, 0.9],
];
const WALKER_R = 0.45; // shoulder half-width + margin
const OVERHEAD_Y = 2.2; // instances above this are canopy — walkable underneath

const solids = [];
for (const [name, list] of Object.entries(demo)) {
  if (SOFT.test(name)) continue;
  const r = (RADII.find(([re]) => re.test(name)) ?? [null, 0.6])[1];
  for (const t of list) {
    if (t[1] > OVERHEAD_Y) continue;
    // Unity → three: x, -z
    solids.push({ name, x: t[0], z: -t[2], r });
  }
}

function check(label, path) {
  const curve = new CatmullRomCurve3(
    path.map(([x, z]) => new Vector3(x, 0, z)),
    true,
  );
  const hits = new Map();
  for (const p of curve.getSpacedPoints(500)) {
    for (const s of solids) {
      const d = Math.hypot(s.x - p.x, s.z - p.z) - s.r - WALKER_R;
      if (d < 0) {
        const k = `${s.name}@(${s.x.toFixed(1)},${s.z.toFixed(1)})`;
        if (!hits.has(k) || hits.get(k).d > d)
          hits.set(k, { d, at: `(${p.x.toFixed(1)},${p.z.toFixed(1)})` });
      }
    }
  }
  console.log(`\n== ${label}: ${hits.size} clearance violation(s) ==`);
  [...hits.entries()]
    .sort((a, b) => a[1].d - b[1].d)
    .forEach(([k, v]) => console.log(`  ${v.d.toFixed(2)}m  ${k}  path@${v.at}`));
  return hits.size;
}

const arg = process.argv[2];
const loops = arg
  ? JSON.parse(readFileSync(arg, 'utf8'))
  : JSON.parse(readFileSync(join(SYNTY, 'scenePlacements.json'), 'utf8')).walkers.map(
      (w) => w.path,
    );
const total = loops.reduce((n, l, i) => n + check(`walker ${i}`, l), 0);
process.exit(total ? 1 : 0);
