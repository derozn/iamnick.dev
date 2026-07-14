/**
 * Attractions — the points of interest in the isometric carnival. Each is a real
 * Synty structure with a floating indicator; clicking it flies the camera in and
 * opens that section's content. `position` is the structure's world centre (the
 * camera's focus target + where the indicator floats); `transform` is its authored
 * Unity placement, kept for the focus highlight.
 */
export type V3 = [number, number, number];

export interface Attraction {
  id: string;
  title: string;
  section: string;
  /** GLB key of the structure (for an optional focus highlight). Absent for
   *  attractions drawn by our own components (the doodle wall board). */
  prefab?: string;
  /** Unity TRS [px,py,pz, qx,qy,qz,qw, sx,sy,sz] of the instance. */
  transform: number[];
  /** World centre — indicator anchor + camera focus target. */
  position: V3;
  /** Unit direction the structure's opening faces — the camera sits on this side when focused. */
  facing: V3;
  /** How far in front of the opening the camera stops when focused. */
  focusDist: number;
}

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'intro',
    title: 'Nick de Rozarieux',
    section: 'intro',
    prefab: 'SM_Prop_Carnival_Entrance_01',
    transform: [-1.77, 0.014, 30.719, 0, 0, 0, 1, 1, 1, 1],
    position: [-1.77, 2.4, -30.7],
    facing: [0, 0, -1],
    focusDist: 11,
  },
  {
    // Above the teacup ride (left of the midway). It's a radially-symmetric ride,
    // so the camera frames it from the iso front-corner angle for a natural pan-in.
    id: 'about',
    title: 'About',
    section: 'about',
    prefab: 'SM_Prop_Teacup_Ride_01',
    transform: [-17.124, 0.116, 5.412, 0, 0.885, 0, -0.466, 1, 1, 1],
    position: [-17.12, 2.2, -5.41],
    facing: [-0.707, 0, -0.707],
    focusDist: 10,
  },
  {
    // Above the clown-face opening of the far-back big-top (Entrance_Clown is the
    // tent's doorway). Its face points down the midway toward the front (−z, U=180°),
    // so the camera sits in front of it for a head-on view of the face.
    id: 'work',
    title: 'Career',
    section: 'work',
    prefab: 'SM_Prop_Entrance_Clown_01',
    transform: [-1.6, 0.15, -21, 0, 1, 0, 0, 1, 1, 1],
    position: [-1.6, 3.0, 21],
    facing: [0, 0, -1],
    focusDist: 11,
  },
  {
    // Above the bumper-car arena (far right). Open ride — framed from the iso
    // front-corner angle so the pan-in matches the overview perspective.
    id: 'projects',
    title: 'Side Projects',
    section: 'projects',
    prefab: 'SM_Prop_Bumper_Car_Arena_01',
    transform: [27.981, 0.084, -5.051, 0, 0.74314, 0, 0.66913, 1, 1, 1],
    position: [28, 2.4, 5.05],
    facing: [-0.707, 0, -0.707],
    focusDist: 13,
  },
  {
    id: 'contact',
    title: 'Contact',
    section: 'contact',
    prefab: 'SM_Prop_Ferris_Wheel_01',
    transform: [-22.16, 0.22, -28.6, 0, 0.312, 0, 0.95, 1, 1, 1],
    position: [-22.25, 6.0, 28.53],
    facing: [0, 0, -1],
    focusDist: 20,
  },
  {
    // The strength-test pole mid-map. Its authored yaw is ~-10°; the camera sits
    // on the +z (front) side so the puck rail + bell read in profile.
    id: 'high-striker',
    title: 'High Striker',
    section: 'game:high-striker',
    prefab: 'SM_Prop_High_Striker_01',
    transform: [-6.689, 0.108, -5.366, 0, -0.089, 0, 0.996, 1, 1, 1],
    // focus target sits mid-pole and the camera stands well back: the prop is
    // ~6.5 m tall and the play fov is 34°, so seeing base-to-bell (+margin)
    // needs ≈0.61·d ≥ 7.5 m → d ≈ 12.5.
    position: [-6.69, 3.1, 5.37],
    facing: [-0.18, 0, 0.98],
    focusDist: 12.5,
  },
  {
    // Madame Zara's fortune-teller wagon ("FORTUNE TELLER" painted on its side),
    // right beside the ball-toss stall. Opens the letterpress chat panel
    // (`chat:` section — a content panel, not a playable). The quat gives the
    // painted side's normal as [-0.97, 0, 0.25] (U = 2·atan2(qy, qw) ≈ −75°);
    // dead-on from there the camera lands inside the ball-toss awning, so the
    // facing is swung ~20° south to shoot from the gap between the two stalls.
    // Verified by headless screenshot.
    id: 'fortune',
    title: 'Fortune Teller',
    section: 'chat:fortune',
    prefab: 'SM_Veh_Wagon_02',
    transform: [21.607, -0.015, 11.343, 0, -0.611, 0, 0.792, 1, 1, 1],
    position: [21.61, 2.2, -11.34],
    facing: [-0.85, 0, 0.53],
    focusDist: 9,
  },
  {
    id: 'ball-toss',
    title: 'Ball Toss',
    section: 'game:ball-toss',
    prefab: 'SM_Prop_Stall_02',
    transform: [13, 0.1, 12, 0, 0.38268, 0, 0.92388, 1, 1, 1],
    // Aim the play camera at the bottle stack on the counter (a touch above it),
    // closer than a content-tent so the small bottles read for the throw.
    position: [13.35, 1.12, -11.0],
    facing: [-0.707, 0, 0.707],
    focusDist: 5.2,
  },
  {
    // The communal doodle wall at the end of the Midway (past contact, per
    // CONTEXT.md's order) — a FREESTANDING bulb-strung tile board on poles
    // in the NE fence corner, drawn entirely by <DoodleWall> (no stall
    // prefab; the first placement sat inside the big tree canopy there —
    // Nick, 2026-07-14). The focus target is the board's centre
    // (doodleWallConfig.BOARD_CENTER), far enough back that the ~2.9 × 2 m
    // board plus its bulb string fills the view (fov 34° → 0.61·d vertical:
    // d ≈ 5.5). The facing is swung south of the board's normal so the
    // camera approaches through the gap between the tree and the fence
    // rather than through the canopy.
    id: 'doodle-wall',
    title: 'Doodle Wall',
    section: 'game:doodle-wall',
    transform: [17.5, 0.1, -39.0, 0, 0.995, 0, -0.0998, 1, 1, 1],
    position: [17.5, 2.0, 39.0],
    facing: [-0.2, 0, -0.98],
    focusDist: 5.5,
  },
];
