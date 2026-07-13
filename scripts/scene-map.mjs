#!/usr/bin/env node
/**
 * scene-map — author NPC + walker placements on a top-down ASCII grid instead of
 * blind float coordinates. Two commands:
 *
 *   node scripts/scene-map.mjs generate   # (re)draw the structures backdrop into
 *                                         # docs/redesign/scene-map.txt, PRESERVING
 *                                         # any annotation characters already placed
 *   node scripts/scene-map.mjs parse      # read the map's annotations → write
 *                                         # src/components/three/synty/scenePlacements.json
 *                                         # (Npcs.tsx consumes it)
 *
 * The grid is the explorable field: three-space x∈[-32,32] (cols, +x = east/right)
 * × z∈[-40,40] (rows, −z = north/top). 1 char = 2.5 m. The iso camera views from
 * the TOP-LEFT corner (−x,−z), so "toward camera" = up-left on the map.
 *
 * Backdrop chars (read-only reference, redrawn by `generate`):
 *   F ferris  O carousel  T teacups  S swings  U bumpers  I high-striker
 *   D dive-tower  ~ dive-pool  E entrance  C big-top  Z fortune-wagon
 *   n stall/tent/building   % foliage   . misc prop   (space) open ground
 *
 * Annotation chars (YOU place these on OPEN cells; `parse` reads them):
 *   NPCs (position = cell centre; facing auto — greeters face away from the
 *   nearest structure, spectators face toward it):
 *     k Carny (barker, faces out)        j Clown male (waving, out)
 *     v Visitor male (clapping, in)      r Ringleader (cheering, out)
 *     l Visitor male (looking, in)       x Visitor female (happy, in)
 *   Walker loops (ordered waypoints, closed loop):
 *     1..9  loop A, in numeric order     a..i  loop B, in letter order
 *
 * The dive-board diver keeps her explicit height in Npcs.tsx (a grid can't do Y),
 * so she is NOT on the map.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAP_PATH = join(ROOT, 'docs/redesign/scene-map.txt');
const OUT_PATH = join(ROOT, 'src/components/three/synty/scenePlacements.json');

const CELL = 2.5,
  X0 = -32,
  Z0 = -40;
const COLS = 26,
  ROWS = 32;
const GROUND_Y = 0.02;
const WALK_FILE = 'SM_Chr_Visitor_Male_01__Walking';
const WALK_SPEED = 1.15;

const cellToWorld = (col, row) => [X0 + (col + 0.5) * CELL, Z0 + (row + 0.5) * CELL];
const worldToCell = (x, z) => [
  Math.max(0, Math.min(COLS - 1, Math.floor((x - X0) / CELL))),
  Math.max(0, Math.min(ROWS - 1, Math.floor((z - Z0) / CELL))),
];

/** NPC role chars → GLB + facing intent. */
const ROLES = {
  k: { file: 'SM_Chr_Carny_01__Idle', look: 'out' },
  v: { file: 'SM_Chr_Visitor_Male_01__Clapping', look: 'in' },
  l: { file: 'SM_Chr_Visitor_Male_01__LookingAround', look: 'in' },
  x: { file: 'SM_Chr_Visitor_female_01__HappyIdle', look: 'in' },
  j: { file: 'SM_Chr_Clown_Male_01__Waving', look: 'out' },
  r: { file: 'SM_Chr_RingLeader_01__Cheering', look: 'out' },
};
const LOOP_A = '123456789';
const LOOP_B = 'abcdefghi';
const ANNOTATION = new Set([...Object.keys(ROLES), ...LOOP_A, ...LOOP_B]);

const backdropChar = (name) => {
  if (/Ferris/.test(name)) return 'F';
  if (/Merry_Go_Round/.test(name)) return 'O';
  if (/Teacup/.test(name)) return 'T';
  if (/Swinging_Chairs/.test(name)) return 'S';
  if (/Bumper_Car_Arena/.test(name)) return 'U';
  if (/High_Striker/.test(name)) return 'I';
  if (/Dive_Tower_Pool/.test(name)) return '~';
  if (/Dive_Tower/.test(name)) return 'D';
  if (/Carnival_Entrance/.test(name)) return 'E';
  if (/Entrance_Clown/.test(name)) return 'C';
  if (/Wagon_02|FortuneTeller/.test(name)) return 'Z';
  if (/Stall|Tent|Booth|Bld_/.test(name)) return 'n';
  // only TREES/bushes are real obstacles; grass/leaves/small scatter + misc
  // props are walkable, so they stay OPEN (keeps the map readable)
  if (/Tree|Bush|Hedge/.test(name)) return '%';
  return ' ';
};
const PRIORITY = 'FOTSUIDEZC~n% '; // higher index = wins the cell
const rank = (ch) => {
  const i = PRIORITY.indexOf(ch);
  return i === -1 ? -1 : PRIORITY.length - i;
};

function buildBackdrop() {
  const demo = JSON.parse(
    readFileSync(join(ROOT, 'src/components/three/synty/demo-instances.json')),
  );
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));
  for (const [name, tfs] of Object.entries(demo)) {
    const ch = backdropChar(name);
    for (const t of tfs) {
      const x = t[0],
        z = -t[2];
      if (x < X0 || x >= -X0 || z < Z0 || z >= -Z0) continue;
      const [c, r] = worldToCell(x, z);
      if (rank(ch) > rank(grid[r][c])) grid[r][c] = ch;
    }
  }
  return grid;
}

/** Place `ch` at (c,r), or the nearest open cell if it's taken (so seeding a
 *  barker who shares his stall's cell doesn't get dropped). */
function placeNearestOpen(grid, c, r, ch) {
  for (let radius = 0; radius <= 5; radius++)
    for (let dr = -radius; dr <= radius; dr++)
      for (let dc = -radius; dc <= radius; dc++) {
        const rr = r + dr,
          cc = c + dc;
        if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue;
        if (grid[rr][cc] === ' ') {
          grid[rr][cc] = ch;
          return;
        }
      }
}

/** Current placements → annotation chars, used to SEED a fresh map. */
function seedAnnotations(grid) {
  // derive the 6 ground NPCs the same way Npcs.tsx does
  const src = readFileSync(join(ROOT, 'src/components/three/synty/attractions.ts'), 'utf8');
  const A = {};
  const re = /id:\s*'([^']+)'[\s\S]*?position:\s*\[([^\]]+)\][\s\S]*?facing:\s*\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(src))) {
    A[m[1]] = { position: m[2].split(',').map(Number), facing: m[3].split(',').map(Number) };
  }
  const specs = [
    ['k', 'ball-toss', 1.8, 1.4],
    ['v', 'about', 6.5, -1.0],
    ['x', 'intro', -2.5, 3.2],
    ['j', 'work', 2.6, 2.2],
    ['r', 'contact', 3.2, 2.6],
    ['l', 'projects', 3.4, 2.2],
  ];
  for (const [ch, id, out, side] of specs) {
    const a = A[id];
    if (!a) continue;
    const [fx, , fz] = a.facing;
    const len = Math.hypot(fx, fz) || 1;
    const nx = fx / len,
      nz = fz / len;
    const x = a.position[0] + nx * out + nz * side;
    const z = a.position[2] + nz * out - nx * side;
    const [c, r] = worldToCell(x, z);
    placeNearestOpen(grid, c, r, ch);
  }
  // current walker loops → digits / letters
  const loops = [
    [
      [4, -24],
      [6, -19],
      [1, -16],
      [-4, -18],
      [-5, -23],
      [-1, -26],
    ],
    [
      [-14, 16],
      [-10, 20],
      [-14, 24],
      [-19, 22],
      [-19, 17],
    ],
  ];
  loops.forEach((path, li) => {
    const syms = li === 0 ? LOOP_A : LOOP_B;
    path.forEach(([x, z], i) => {
      const [c, r] = worldToCell(x, z);
      if (syms[i]) placeNearestOpen(grid, c, r, syms[i]);
    });
  });
}

function render(grid) {
  const head = '        x=-32' + ' '.repeat(COLS - 13) + 'x=+32';
  const lines = [head, '       +' + '-'.repeat(COLS) + '+'];
  for (let r = 0; r < ROWS; r++) {
    const z = String(Z0 + r * CELL).padStart(4);
    lines.push(` z=${z} |${grid[r].join('')}|`);
  }
  lines.push('       +' + '-'.repeat(COLS) + '+');
  return lines.join('\n');
}

function generate() {
  const grid = buildBackdrop();
  if (existsSync(MAP_PATH)) {
    // preserve annotations the user already placed, redraw everything else
    const prev = readFileSync(MAP_PATH, 'utf8').split('\n');
    for (const line of prev) {
      const m = line.match(/^ z=\s*(-?\d+(?:\.\d+)?) \|(.*)\|$/);
      if (!m) continue;
      const r = Math.round((Number(m[1]) - Z0) / CELL);
      if (r < 0 || r >= ROWS) continue;
      for (let c = 0; c < COLS && c < m[2].length; c++) {
        if (ANNOTATION.has(m[2][c])) grid[r][c] = m[2][c];
      }
    }
  } else {
    seedAnnotations(grid); // first run: start from the current scene
  }
  const legend = readFileSync(fileURLToPath(import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.startsWith(' *'))
    .map((l) => l.replace(/^ \*\/?/, '   ').replace(/^ \* ?/, '   '))
    .join('\n');
  writeFileSync(MAP_PATH, render(grid) + '\n\n LEGEND\n' + legend + '\n');
  console.log('wrote', MAP_PATH);
}

function facingYaw(grid, c, r, look) {
  // nearest structure cell within 4 cells → face toward (in) / away (out)
  let best = null,
    bd = Infinity;
  for (let dr = -4; dr <= 4; dr++)
    for (let dc = -4; dc <= 4; dc++) {
      const rr = r + dr,
        cc = c + dc;
      if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue;
      const ch = grid[rr][cc];
      if ('FOTSUIDEZCn~'.includes(ch)) {
        const d = dr * dr + dc * dc;
        if (d > 0 && d < bd) {
          bd = d;
          best = [dc, dr];
        }
      }
    }
  let dx, dz;
  if (best) {
    [dx, dz] = best; // vector from NPC to structure (in grid units; dz≈+z)
  } else {
    dx = -1; // no structure near → face the camera corner (−x,−z)
    dz = -1;
  }
  if (look === 'out') {
    dx = -dx;
    dz = -dz;
  }
  return Math.atan2(dx, dz);
}

function parse() {
  const grid = readFileSync(MAP_PATH, 'utf8')
    .split('\n')
    .reduce(
      (acc, line) => {
        const m = line.match(/^ z=\s*(-?\d+(?:\.\d+)?) \|(.*)\|$/);
        if (m) {
          const r = Math.round((Number(m[1]) - Z0) / CELL);
          if (r >= 0 && r < ROWS) acc[r] = m[2];
        }
        return acc;
      },
      Array.from({ length: ROWS }, () => ' '.repeat(COLS)),
    );

  const npcs = [];
  const loopA = [],
    loopB = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const ch = grid[r][c];
      if (ROLES[ch]) {
        const [x, z] = cellToWorld(c, r);
        npcs.push({
          file: ROLES[ch].file,
          pos: [x, GROUND_Y, z],
          yaw: facingYaw(grid, c, r, ROLES[ch].look),
        });
      } else if (LOOP_A.includes(ch)) {
        loopA.push([LOOP_A.indexOf(ch), cellToWorld(c, r)]);
      } else if (LOOP_B.includes(ch)) {
        loopB.push([LOOP_B.indexOf(ch), cellToWorld(c, r)]);
      }
    }
  const toPath = (loop) => loop.sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  const walkers = [];
  if (loopA.length >= 3)
    walkers.push({ file: WALK_FILE, path: toPath(loopA), speed: WALK_SPEED, phase: 0 });
  if (loopB.length >= 3)
    walkers.push({ file: WALK_FILE, path: toPath(loopB), speed: WALK_SPEED * 0.9, phase: 0.5 });

  writeFileSync(OUT_PATH, JSON.stringify({ npcs, walkers }, null, 2) + '\n');
  console.log(`wrote ${OUT_PATH}: ${npcs.length} NPCs, ${walkers.length} walker loop(s)`);
}

const cmd = process.argv[2];
if (cmd === 'generate') generate();
else if (cmd === 'parse') parse();
else {
  console.error('usage: node scripts/scene-map.mjs generate|parse');
  process.exit(1);
}
