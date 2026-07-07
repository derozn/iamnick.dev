/**
 * ticketConfig — the golden-ticket hunt as data. NO three imports: the DOM HUD
 * reads TICKET_COUNT from here, so this must stay static-bundle safe.
 *
 * Positions are three-space, tucked at landmarks around the map so finding them
 * all means exploring the whole carnival. `pos[1]` is the bob centre height.
 * Tune positions here (HMR-live) after eyeballing screenshots.
 */
export const TICKETS: { id: string; pos: [number, number, number] }[] = [
  { id: 'entrance', pos: [-3.6, 1.6, -28.6] }, // by the welcome arch
  { id: 'teacups', pos: [-14.6, 1.4, -3.8] }, // teacup ride rim
  { id: 'carousel', pos: [21.8, 1.6, 23.4] }, // merry-go-round
  { id: 'ferris', pos: [-20.2, 1.8, 26.0] }, // ferris wheel queue
  { id: 'bigtop', pos: [0.9, 1.6, 19.2] }, // clown-mouth doorway
  { id: 'bumpers', pos: [25.6, 1.5, 2.8] }, // bumper-car arena
  { id: 'swings', pos: [6.6, 1.5, 11.4] }, // swing ride
  { id: 'striker', pos: [-5.4, 1.4, 6.6] }, // high striker
];

export const TICKET_COUNT = TICKETS.length;

/* Motion feel */
export const BOB_AMP = 0.09; // metres of vertical bob
export const BOB_HZ = 1.5; // bob speed
export const SPIN = 0.9; // rad/s spin
/** Camera distance beyond which tickets idle (keeps the demand loop quiet). */
export const ANIM_RANGE = 42;
