'use client';

import { motion, useReducedMotion } from 'motion/react';

import { type SideProject } from '@/content/cv';
import { SectionShell } from './SectionShell';
import { MotionCard } from './MotionCard';

interface SideProjectsSectionProps {
  projects: SideProject[];
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block translate-y-[-1px]"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ProjectCard({ project, flip }: { project: SideProject; flip: boolean }) {
  return (
    <MotionCard flip={flip} className="h-full" cardClassName="p-6 md:p-8 [--hud-cut:16px]">
      <article aria-label={project.name} className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-expressive text-[22px] font-semibold text-text-primary">
            {project.name}
          </h3>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hud-button shrink-0 px-3 py-1.5 font-functional text-[12px] text-accent [--hud-cut:8px]"
              aria-label={`Visit ${project.name} (opens in a new tab)`}
            >
              Visit site <ExternalIcon />
            </a>
          )}
        </div>

        <p className="text-shadow-scrim mt-3 text-[14px] leading-relaxed text-text-primary/75">
          {project.blurb}
        </p>

        <ul className="mt-4 space-y-2">
          {project.highlights.map((h, i) => (
            <li
              key={i}
              className="text-shadow-scrim flex gap-2 text-[13px] leading-relaxed text-text-primary/75"
            >
              <span className="mt-[7px] h-1 w-3 shrink-0 bg-accent/60" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <ul aria-label="Technologies" className="mt-auto flex flex-wrap gap-2 pt-6">
          {project.tech.map((t) => (
            <li key={t} className="hud-chip px-3 py-1 font-functional text-[12px] text-accent/90">
              {t}
            </li>
          ))}
        </ul>
      </article>
    </MotionCard>
  );
}

const headingId = 'side-projects-heading';

/**
 * SideProjectsSection — cards for notable side projects with external links.
 */
export function SideProjectsSection({ projects }: SideProjectsSectionProps) {
  const reduced = useReducedMotion();

  return (
    <section aria-labelledby={headingId} data-attraction="projects" className="w-full">
      <SectionShell>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="mb-3 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 shrink-0 bg-accent/70" />
            <p className="font-expressive text-[12px] font-semibold uppercase tracking-widest text-accent">
              Side work
            </p>
          </div>
          <h2
            id={headingId}
            className="text-shadow-scrim font-expressive text-[28px] font-semibold text-text-primary md:text-[36px]"
          >
            Projects
          </h2>
        </motion.div>

        <div className="mt-8 grid items-stretch gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} flip={i % 2 !== 0} />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
