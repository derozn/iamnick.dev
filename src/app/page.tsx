import { roles, sideProjects, skillGroups } from '@/content/cv';
import { JourneyCanvas } from '@/components/three/JourneyCanvas';
import { HeroSection } from '@/components/organisms/HeroSection';
import { RoleSection } from '@/components/organisms/RoleSection';
import { EarlierRolesSection } from '@/components/organisms/EarlierRolesSection';
import { SideProjectsSection } from '@/components/organisms/SideProjectsSection';
import { AboutSection } from '@/components/organisms/AboutSection';
import { ContactSection } from '@/components/organisms/ContactSection';

// Split roles into featured (newest first) and earlier (non-featured)
const featuredRoles = roles.filter((r) => r.featured);
const earlierRoles = roles.filter((r) => !r.featured);

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

      {/* Scroll-driven 3-D journey — fixed, behind all content */}
      <JourneyCanvas />

      <main id="main">
        {/* Hero — LCP element */}
        <HeroSection />

        {/* Featured roles — each gets a full-screen section with alternating card alignment */}
        {featuredRoles.map((role, index) => (
          <RoleSection key={role.id} role={role} index={index} />
        ))}

        {/* Earlier non-featured roles — condensed timeline */}
        <EarlierRolesSection roles={earlierRoles} />

        {/* Side projects */}
        <SideProjectsSection projects={sideProjects} />

        {/* About + skills */}
        <AboutSection skillGroups={skillGroups} />

        {/* Contact */}
        <ContactSection />
      </main>
    </>
  );
}
