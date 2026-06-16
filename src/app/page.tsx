import { MidwayCanvas } from '@/components/three/MidwayCanvas';
import { ContentOverlay } from '@/components/content/ContentOverlay';
import { BallTossHud } from '@/components/three/game/BallTossHud';

export const dynamic = 'auto';

/**
 * Homepage — the isometric, explorable Dark Carnival.
 *
 * A fixed full-screen canvas the visitor drags/zooms around; floating indicators
 * mark each point of interest, and clicking one flies the camera in and opens that
 * CV section in the neon HUD overlay (ContentOverlay).
 *
 * TODO(content/SEO): render all sections as always-present DOM (visually hidden)
 * so they're crawlable/keyboard-navigable, with the HUD as the enhanced view.
 */
export default function Homepage() {
  return (
    <>
      {/* Isometric Dark Carnival — fixed, fills the viewport */}
      <MidwayCanvas />

      {/* Content panel that rises over the scene when a structure is focused */}
      <ContentOverlay />

      {/* DOM overlay for the ball-toss game (score / balls / exit / win-lose) */}
      <BallTossHud />
    </>
  );
}
