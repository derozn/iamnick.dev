import { MidwayCanvas } from '@/components/three/MidwayCanvas';
import { ContentOverlay } from '@/components/content/ContentOverlay';

export const dynamic = 'auto';

/**
 * Homepage — the on-rails carnival walk + click-to-step-in content.
 *
 * Scroll length drives the first-person walk; clicking a tent's glowing marker
 * opens that CV section in the neon HUD overlay (ContentOverlay). The scroll
 * spacer is `pointer-events-none` so clicks fall through to the canvas markers,
 * while the wheel still scrolls the page.
 *
 * TODO(content/SEO): render all sections as always-present DOM (visually hidden)
 * so they're crawlable/keyboard-navigable, with the HUD as the enhanced view.
 */
export default function Homepage() {
  return (
    <>
      {/* First-person Dark Carnival — fixed, behind everything */}
      <MidwayCanvas />

      {/* Content panel that rises over the dimmed scene on click */}
      <ContentOverlay />

      {/* Scroll spacer — drives the walk; transparent to clicks so markers are reachable */}
      <main id="main" aria-hidden="true" className="pointer-events-none">
        <div style={{ height: '600vh' }} />
      </main>
    </>
  );
}
