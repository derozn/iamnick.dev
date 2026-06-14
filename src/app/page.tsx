import { roles, sideProjects, skillGroups } from '@/content/cv';
import { MidwayCanvas } from '@/components/three/MidwayCanvas';
import { HeaderSection } from '@/components/organisms/HeaderSection';
import { RoleSection } from '@/components/organisms/RoleSection';
import { EarlierRolesSection } from '@/components/organisms/EarlierRolesSection';
import { SideProjectsSection } from '@/components/organisms/SideProjectsSection';
import { ContactSection } from '@/components/organisms/ContactSection';

const byStartAscending = (a: { start: string }, b: { start: string }) =>
  a.start.localeCompare(b.start);

/**
 * Career Highlights run **earliest → present** (CONTEXT.md):
 *   - earlier (non-featured) roles open the run, condensed and earliest-first
 *   - featured roles follow as their own attractions, earliest-first, current last
 */
const featuredRoles = roles.filter((r) => r.featured).sort(byStartAscending);
const earlierRoles = roles.filter((r) => !r.featured).sort(byStartAscending);

export const dynamic = 'auto';

export default function Homepage() {
  return (
    <>
      {/* Skip link — accessible, sr-only until focused */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-2 focus:bg-accent focus:px-4 focus:py-2 focus:font-functional focus:text-[14px] focus:font-semibold focus:text-background-primary focus:outline-none"
      >
        Skip to main content
      </a>

      {/* On-rails Dark Carnival — fixed, behind all content */}
      <MidwayCanvas />

      <main id="main">
        {/* Attraction 1 — Entrance: name, title, bio + skills (About folded in). LCP <h1>. */}
        <HeaderSection skillGroups={skillGroups} />

        {/* Attraction 2 — Career Highlights, earliest → present.
            Opens with education + earliest roles, then each featured role. */}
        <EarlierRolesSection roles={earlierRoles} />
        {featuredRoles.map((role, index) => (
          <RoleSection key={role.id} role={role} index={index} />
        ))}

        {/* TODO(phase-3): Ball-toss stall here (Full only; scenery on Lite). */}

        {/* Attraction — Side projects */}
        <SideProjectsSection projects={sideProjects} />

        {/* Attraction — Contact */}
        <ContactSection />

        {/* TODO(phase-4): Doodle wall stall after contact. */}
      </main>
    </>
  );
}
