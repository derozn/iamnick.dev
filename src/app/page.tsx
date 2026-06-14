import { MidwayCanvas } from '@/components/three/MidwayCanvas';

export const dynamic = 'auto';

/**
 * Homepage — scene-evaluation pass.
 *
 * The page is intentionally reduced to the 3-D carnival + a scroll spacer so the
 * scene can be judged on its own (HUD + content are out of scope this pass —
 * see docs/redesign/scene-layout.md). Scroll length drives the first-person walk
 * down the midway; the content spine and HUD return once sections are mapped
 * onto street positions. The DOM section components (HeaderSection, RoleSection,
 * …) are kept in the tree for that step.
 */
export default function Homepage() {
  return (
    <>
      {/* First-person Dark Carnival — fixed, behind everything */}
      <MidwayCanvas />

      {/* Scroll spacer — drives the on-rails walk (≈ one screen per zone) */}
      <main id="main" aria-hidden="true">
        <div style={{ height: '600vh' }} />
      </main>
    </>
  );
}
