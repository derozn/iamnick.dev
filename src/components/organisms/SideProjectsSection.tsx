'use client';

import { motion, useReducedMotion } from 'motion/react';

import { type SideProject } from '@/content/cv';
import { SectionShell } from './SectionShell';
import { cn } from '@/lib/cn';

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

function ProjectCard({ project }: { project: SideProject }) {
  return (
    <article
      aria-label={project.name}
      className={cn(
        'flex flex-col rounded-3 bg-background-primary/70 backdrop-blur-md',
        'border border-border-primary/10 p-6 md:p-8',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-expressive text-[22px] font-semibold text-text-primary">
          {project.name}
        </h3>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-2 border border-accent/30 px-3 py-1 font-functional text-[12px] text-accent transition-colors hover:border-accent hover:text-accent focus-visible:outline-accent"
            aria-label={`Visit ${project.name} (opens in a new tab)`}
          >
            Visit site <ExternalIcon />
          </a>
        )}
      </div>

      <p className="mt-3 text-[14px] leading-relaxed text-text-primary/70">{project.blurb}</p>

      <ul className="mt-4 space-y-2">
        {project.highlights.map((h, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-text-primary/70">
            <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <li
            key={t}
            className="rounded-2 border border-accent/30 px-3 py-1 font-functional text-[12px] text-accent/80"
          >
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}

const headingId = 'side-projects-heading';

/**
 * SideProjectsSection — cards for notable side projects with external links.
 */
export function SideProjectsSection({ projects }: SideProjectsSectionProps) {
  const reduced = useReducedMotion();

  return (
    <section aria-labelledby={headingId} data-journey-stop="projects" className="w-full">
      <SectionShell>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="mb-2 font-expressive text-[12px] font-semibold uppercase tracking-widest text-accent">
            Side work
          </p>
          <h2
            id={headingId}
            className="font-expressive text-[28px] font-semibold text-text-primary md:text-[36px]"
          >
            Projects
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </motion.div>
      </SectionShell>
    </section>
  );
}
