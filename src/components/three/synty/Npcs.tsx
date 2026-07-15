'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF, useTexture } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  CatmullRomCurve3,
  type Group,
  MeshStandardMaterial,
  type Mesh,
  SRGBColorSpace,
  type Texture,
  Vector3,
} from 'three';

import npcManifest from './npcManifest.json';
import { ATTRACTIONS } from './attractions';
import scenePlacements from './scenePlacements.json';

/**
 * Npcs — the carnival's people: Synty characters run through Mixamo (idle /
 * wave / cheer loops) and converted via scripts/convert-npcs.sh. Each entry
 * places one animated character inside an existing warm light pool (NO new
 * lights), staggered in time so the crowd doesn't move in lockstep.
 *
 * The data array is filtered against npcManifest.json (written by the convert
 * script), so characters that haven't been converted yet simply don't render —
 * this component is safe to ship before the Mixamo pass lands.
 *
 * Perf: shared Synty base atlas (drei caches by URL ⇒ zero extra VRAM), no
 * shadows, mixers pause beyond MIXER_RANGE of the camera on the high tier and
 * freeze on a natural mid-clip pose on the low tier (demand loop stays quiet).
 */

interface NpcPlacement {
  file: string;
  pos: [number, number, number];
  yaw: number;
  scale?: number;
}

/**
 * NPCs are placed RELATIVE to their attraction (single source of truth in
 * attractions.ts) rather than by blind coordinates, so they can't drift away
 * from their booth. For an attraction with ground centre `C` and opening normal
 * `facing` (which points from the structure toward the visitor/iso camera):
 *   - `out`  metres along +facing = how far in FRONT of the structure they stand
 *   - `side` metres along the ground-right vector = lateral shift off the fly-in
 *            axis, so they dress the scene without blocking the focused view
 *   - `look` = 'out' (greeter/barker facing passers-by) or 'in' (spectator
 *            watching the attraction)
 */
const GROUND_Y = 0.02;

/**
 * Model forward axis. Synty/Mixamo humanoids export facing +Z; if the whole
 * crowd ends up facing backwards, flip this to Math.PI (one line fixes all).
 */
const FORWARD_OFFSET = 0;

interface NpcSpec {
  file: string;
  at: string; // attraction id
  out: number;
  side: number;
  look: 'in' | 'out';
}

const NPC_SPECS: NpcSpec[] = [
  // barker working the front of the ball-toss stall, calling to the crowd
  { file: 'SM_Chr_Carny_01__Idle', at: 'ball-toss', out: 1.8, side: 1.4, look: 'out' },
  // visitor clapping at the teacup ride — well clear of the ride's wide radius
  { file: 'SM_Chr_Visitor_Male_01__Clapping', at: 'about', out: 6.5, side: -1.0, look: 'in' },
  // visitor just INSIDE the entrance arch (negative out = fair side, not out on
  // the dark approach), gazing into the fair
  { file: 'SM_Chr_Visitor_female_01__HappyIdle', at: 'intro', out: -2.5, side: 3.2, look: 'in' },
  // clown waving at the big-top mouth
  { file: 'SM_Chr_Clown_Male_01__Waving', at: 'work', out: 2.6, side: 2.2, look: 'out' },
  // (the clown that used to spectate the striker is now the nervous diver on the
  //  dive board — see EXPLICIT below; her striker spot sat in the dive POOL)
  // the ringleader presenting the ferris wheel
  { file: 'SM_Chr_RingLeader_01__Cheering', at: 'contact', out: 3.2, side: 2.6, look: 'out' },
  // visitor taking in the bumper-car arena
  {
    file: 'SM_Chr_Visitor_Male_01__LookingAround',
    at: 'projects',
    out: 3.4,
    side: 2.2,
    look: 'in',
  },
];

const yawTo = (dx: number, dz: number) => Math.atan2(dx, dz) + FORWARD_OFFSET;

/**
 * Explicit placements (not derived from an attraction) — one-off spots keyed to
 * scene geometry rather than a POI. The dive-board diver perches on the board of
 * `SM_Prop_Dive_Tower_01` (three (-11.5, 12.1), yaw 146°, board points toward the
 * pool); DIVE_PERCH_Y is the deck height — the TOP platform, found from a vertex
 * histogram of the tower (a 612-vertex flat surface at 8.25 m; the 8.75 m band
 * is the guard rail). Her origin is at her feet, so this stands her on the deck.
 */
const DIVE_PERCH_Y = 8.25;
const EXPLICIT: NpcPlacement[] = [
  {
    file: 'SM_Chr_Clown_Female_01__Idle',
    pos: [-10.3, DIVE_PERCH_Y, 10.3],
    yaw: yawTo(0.56, -0.83), // face out along the board, toward the water
  },
];

/** Attraction-derived placements (the code baseline / seed for the scene map). */
const DERIVED: NpcPlacement[] = NPC_SPECS.flatMap((s) => {
  const a = ATTRACTIONS.find((x) => x.id === s.at);
  if (!a) return [];
  const [fx, , fz] = a.facing; // opening normal (structure → visitor), y ignored
  const flen = Math.hypot(fx, fz) || 1;
  const nx = fx / flen;
  const nz = fz / flen;
  // ground-right vector (facing rotated −90° about Y)
  const rx = nz;
  const rz = -nx;
  const pos: [number, number, number] = [
    a.position[0] + nx * s.out + rx * s.side,
    GROUND_Y,
    a.position[2] + nz * s.out + rz * s.side,
  ];
  // face the visitor (out = +facing) or the attraction (in = −facing)
  const yaw = s.look === 'out' ? yawTo(nx, nz) : yawTo(-nx, -nz);
  return [{ file: s.file, pos, yaw }];
});

/**
 * Ground NPCs come from the scene map (`docs/redesign/scene-map.txt` →
 * `scripts/scene-map.mjs parse` → scenePlacements.json) once it's been authored;
 * until then the attraction-derived baseline above renders. The dive-board diver
 * is ALWAYS from EXPLICIT — the grid can't express her 8.25 m perch height.
 */
const mapped = scenePlacements.npcs as unknown as NpcPlacement[];
const NPCS: NpcPlacement[] = (mapped.length ? mapped : DERIVED).concat(EXPLICIT);

/** Camera distance beyond which an NPC's mixer pauses (high tier). */
const MIXER_RANGE = 45;
const SYNTY = '/models/synty/';

const available = new Set(npcManifest as string[]);
const PLACED = NPCS.filter((n) => available.has(n.file));

/* ------------------------------------------------------------- walkers */

/**
 * Strollers that follow a looped path (needs the in-place Walking clip). High
 * tier only — a walker frozen mid-stride on the demand-frameloop low tier reads
 * as broken, so mobile keeps the static crowd above.
 *
 * Each path is a closed Catmull-Rom loop of three-space [x, z] waypoints. These
 * are hand-routed through open ground — **tune the waypoints if a walker clips
 * a tent or ride** (they're the obvious knob, like the NPC specs above), then
 * verify with `node scripts/walker-clearance.mjs`, which samples each loop
 * against every solid prop instance (the spline bulges outside its waypoint
 * polygon, so eyeballing the waypoints alone is not enough — that's how the
 * originals ended up inside a barricade line). `speed` is m/s; `phase` [0,1)
 * staggers where each starts on its loop.
 */
const WALK_FILE = 'SM_Chr_Visitor_Male_01__Walking';
const WALK_SPEED = 1.15;

interface WalkerSpec {
  path: [number, number][];
  speed: number;
  phase: number;
}

/** Attraction-derived baseline; the scene map overrides it once authored. */
const WALKERS_BASELINE: WalkerSpec[] = [
  // promenade on the west verge of the entrance approach — the pocket between
  // the arch, the bush line and the bouncy-castle barricade ring (clearance-
  // checked; the old loop ran through the z≈-18 barricade line and the castle)
  {
    path: [
      [-0.9, -28.8],
      [-3.5, -28.0],
      [-5.0, -26.3],
      [-3.0, -25.2],
      [-1.1, -25.9],
    ],
    speed: WALK_SPEED,
    phase: 0,
  },
  // an idle meander on the open patch north of the SW-plaza clutter — the
  // plaza itself is split by a barricade fence at x≈-14.2 and strewn with hay
  // bales / bins / a bear trap, so the only clean cell is this one; slow so
  // the small circuit reads as loitering, not laps
  {
    path: [
      [-15.7, 24.8],
      [-16.8, 25.2],
      [-17.5, 25.4],
      [-16.9, 26.5],
      [-15.8, 26.5],
      [-15.4, 25.6],
    ],
    speed: 0.7,
    phase: 0.5,
  },
];

const mappedWalkers = scenePlacements.walkers as unknown as WalkerSpec[];
const WALKERS: WalkerSpec[] = mappedWalkers.length ? mappedWalkers : WALKERS_BASELINE;

const _wp = new Vector3();
const _wt = new Vector3();

function Walker({ spec, material }: { spec: WalkerSpec; material: MeshStandardMaterial }) {
  const { scene, animations } = useGLTF(`/models/npcs/${WALK_FILE}.glb`);
  const model = useMemo(() => {
    const c = skeletonClone(scene) as Group;
    c.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) {
        m.material = material;
        m.castShadow = false;
        m.receiveShadow = false;
        m.frustumCulled = false;
      }
    });
    return c;
  }, [scene, material]);

  const group = useRef<Group>(null);
  const { actions } = useAnimations(animations, model);
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        spec.path.map(([x, z]) => new Vector3(x, GROUND_Y, z)),
        true,
      ),
    [spec.path],
  );
  const len = useMemo(() => curve.getLength(), [curve]);
  const t = useRef(spec.phase);

  useEffect(() => {
    const a = Object.values(actions)[0];
    a?.reset().play();
    return () => {
      a?.stop();
    };
  }, [actions]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // advance along the loop; the in-place walk cycle plays underneath, speed
    // roughly matched to the cadence so the feet don't obviously skate
    t.current = (t.current + (spec.speed * Math.min(delta, 0.1)) / len) % 1;
    curve.getPointAt(t.current, _wp);
    g.position.copy(_wp);
    curve.getTangentAt(t.current, _wt);
    g.rotation.y = Math.atan2(_wt.x, _wt.z) + FORWARD_OFFSET;
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

function Npc({
  placement,
  material,
  offset,
  high,
}: {
  placement: NpcPlacement;
  material: MeshStandardMaterial;
  offset: number;
  high: boolean;
}) {
  const { scene, animations } = useGLTF(`/models/npcs/${placement.file}.glb`);
  // SkeletonUtils.clone is mandatory for skinned meshes (a reused character —
  // Visitor_Male appears twice — must not share bone instances).
  const model = useMemo(() => {
    const c = skeletonClone(scene) as Group;
    c.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) {
        m.material = material;
        m.castShadow = false;
        m.receiveShadow = false;
        // animated bounds are unreliable; cost is bounded by the pool size
        m.frustumCulled = false;
      }
    });
    return c;
  }, [scene, material]);

  const group = useRef<Group>(null);
  const { mixer, actions } = useAnimations(animations, model);
  const anchor = useMemo(() => new Vector3(...placement.pos), [placement]);

  useEffect(() => {
    const action = Object.values(actions)[0];
    if (!action) return;
    action.reset().play();
    // stagger so the crowd doesn't move in sync; low tier freezes on a pose
    mixer.setTime(offset);
    if (!high) action.paused = true;
    return () => {
      action.stop();
    };
  }, [actions, mixer, offset, high]);

  useFrame(({ camera }) => {
    if (!high) return; // low tier: statue with a natural pose
    const action = Object.values(actions)[0];
    if (action) action.paused = anchor.distanceTo(camera.position) > MIXER_RANGE;
  });

  return (
    <group
      ref={group}
      position={placement.pos}
      rotation={[0, placement.yaw, 0]}
      scale={placement.scale ?? 1}
    >
      <primitive object={model} />
    </group>
  );
}

export function Npcs({ high }: { high: boolean }) {
  // same texture object as SyntyScene's (drei caches by URL) — zero extra VRAM
  const baseAtlas = useTexture(`${SYNTY}base-atlas.png`, (t) => {
    const tex = t as Texture;
    tex.flipY = false;
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
  }) as Texture;

  const material = useMemo(
    () => new MeshStandardMaterial({ map: baseAtlas, roughness: 0.9, metalness: 0 }),
    [baseAtlas],
  );

  const walkersOn = high && available.has(WALK_FILE);

  if (PLACED.length === 0 && !walkersOn) return null;
  return (
    <>
      {PLACED.map((p, i) => (
        <Npc
          key={`${p.file}-${i}`}
          placement={p}
          material={material}
          offset={i * 0.7}
          high={high}
        />
      ))}
      {walkersOn &&
        WALKERS.map((w, i) => <Walker key={`walker-${i}`} spec={w} material={material} />)}
    </>
  );
}
