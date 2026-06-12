'use client';

import { profile, type SkillGroup } from '@/content/cv';
import { SectionShell } from './SectionShell';
import { MotionCard, MotionItem } from './MotionCard';

interface AboutSectionProps {
  skillGroups: SkillGroup[];
}

const headingId = 'about-heading';

/**
 * AboutSection — bio, skill groups, and a placeholder for personal copy.
 */
export function AboutSection({ skillGroups }: AboutSectionProps) {
  return (
    <section aria-labelledby={headingId} data-journey-stop="about" className="w-full">
      <SectionShell>
        <MotionCard>
          <MotionItem className="mb-3 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 shrink-0 bg-accent/70" />
            <p className="font-expressive text-[12px] font-semibold uppercase tracking-widest text-accent">
              The person
            </p>
          </MotionItem>

          <MotionItem>
            <h2
              id={headingId}
              className="font-expressive text-[28px] font-semibold text-text-primary md:text-[36px]"
            >
              About
            </h2>
          </MotionItem>

          <MotionItem>
            <p className="text-shadow-scrim mt-5 max-w-prose text-[15px] leading-relaxed text-text-primary/80">
              {profile.shortBio}
            </p>
          </MotionItem>

          {/* TODO(nick): personal about copy */}

          {/* Skill groups */}
          <div className="mt-10 space-y-7">
            {skillGroups.map((group) => (
              <MotionItem key={group.label}>
                <h3 className="mb-3 font-expressive text-[13px] font-semibold uppercase tracking-widest text-accent/70">
                  {group.label}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="hud-chip px-3 py-1 font-functional text-[13px] text-text-primary/80"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </MotionItem>
            ))}
          </div>
        </MotionCard>
      </SectionShell>
    </section>
  );
}
