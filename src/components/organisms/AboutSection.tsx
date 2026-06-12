'use client';

import { motion, useReducedMotion } from 'motion/react';

import { profile, type SkillGroup } from '@/content/cv';
import { SectionShell, ContentCard } from './SectionShell';

interface AboutSectionProps {
  skillGroups: SkillGroup[];
}

const headingId = 'about-heading';

/**
 * AboutSection — bio, skill groups, and a placeholder for personal copy.
 */
export function AboutSection({ skillGroups }: AboutSectionProps) {
  const reduced = useReducedMotion();

  return (
    <section aria-labelledby={headingId} className="w-full">
      <SectionShell>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <ContentCard>
            <p className="mb-2 font-expressive text-[12px] font-semibold uppercase tracking-widest text-accent">
              The person
            </p>
            <h2
              id={headingId}
              className="font-expressive text-[28px] font-semibold text-text-primary md:text-[36px]"
            >
              About
            </h2>

            <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-text-primary/80">
              {profile.shortBio}
            </p>

            {/* TODO(nick): personal about copy */}

            {/* Skill groups */}
            <div className="mt-10 space-y-6">
              {skillGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="mb-3 font-expressive text-[13px] font-semibold uppercase tracking-widest text-accent/70">
                    {group.label}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-2 border border-accent/20 px-3 py-1 font-functional text-[13px] text-text-primary/70"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ContentCard>
        </motion.div>
      </SectionShell>
    </section>
  );
}
