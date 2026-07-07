import { MidwayCanvas } from '@/components/three/MidwayCanvas';
import { ContentOverlay } from '@/components/content/ContentOverlay';
import { StaticResume } from '@/components/content/StaticResume';
import { IntroOverlay } from '@/components/content/IntroOverlay';
import { DebugBridge } from '@/components/content/DebugBridge';
import { AudioDirector } from '@/components/content/AudioDirector';
import { TicketHud } from '@/components/three/tickets/TicketHud';
import { BallTossHud } from '@/components/three/game/BallTossHud';
import { HighStrikerHud } from '@/components/three/game/HighStrikerHud';

export const dynamic = 'auto';

/**
 * Homepage — the isometric, explorable Dark Carnival.
 *
 * A fixed full-screen canvas the visitor drags/zooms around; floating indicators
 * mark each point of interest, and clicking one flies the camera in and opens that
 * CV section in the neon HUD overlay (ContentOverlay).
 *
 * The full CV is also mirrored in <StaticResume> as visually-hidden, always-present
 * DOM, so the page is crawlable and screen-reader-navigable without the canvas.
 */
export default function Homepage() {
  return (
    <>
      {/* Crawlable / accessible CV — the page's real content (sr-only) */}
      <StaticResume />

      {/* Isometric Dark Carnival — fixed, fills the viewport */}
      <MidwayCanvas />

      {/* Bruno-Simon-style entry: loading screen → framed vignette → "click to start" */}
      <IntroOverlay />

      {/* Content panel that rises over the scene when a structure is focused */}
      <ContentOverlay />

      {/* DOM overlay for the ball-toss game (score / balls / exit / win-lose) */}
      <BallTossHud />

      {/* DOM overlay for the high-striker game (gauge / swings / verdict) */}
      <HighStrikerHud />

      {/* Golden-ticket hunt tally + full-house modal */}
      <TicketHud />

      {/* Scene state → audio mixer (ambience on enter, duck under panels, mute) */}
      <AudioDirector />

      {/* Headless-verification hook — inert unless the URL carries ?debug=1 */}
      <DebugBridge />
    </>
  );
}
