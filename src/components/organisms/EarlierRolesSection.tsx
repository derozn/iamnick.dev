'use client';

import { motion, useReducedMotion } from 'motion/react';

import { type Role } from '@/content/cv';
import { formatYearMonth } from '@/lib/formatDate';
import { SectionShell, ContentCard } from './SectionShell';

interface EarlierRolesSectionProps {
  roles: Role[];
}

interface EarlierRoleItemProps {
  role: Role;
}

function EarlierRoleItem({ role }: EarlierRoleItemProps) {
  const dateRange = `${formatYearMonth(role.start)} – ${formatYearMonth(role.end)}`;

  return (
    <li className="border-t border-border-primary/10 py-6 first:border-t-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <span className="font-expressive text-[18px] font-semibold text-text-primary">
            {role.company}
          </span>
          <span className="ml-3 font-functional text-[14px] text-text-primary/60">
            {role.title}
          </span>
        </div>
        <span className="font-functional text-[12px] text-accent/70 sm:shrink-0">{dateRange}</span>
      </div>

      <ul className="mt-3 space-y-1">
        {role.highlights.slice(0, 2).map((h, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-text-primary/70">
            <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

/**
 * EarlierRolesSection — condensed timeline for non-featured roles.
 */
export function EarlierRolesSection({ roles }: EarlierRolesSectionProps) {
  const reduced = useReducedMotion();
  const headingId = 'earlier-roles-heading';

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
              Earlier experience
            </p>
            <h2
              id={headingId}
              className="font-expressive text-[28px] font-semibold text-text-primary md:text-[36px]"
            >
              Previous Roles
            </h2>

            <ul className="mt-8" aria-label="Earlier roles">
              {roles.map((role) => (
                <EarlierRoleItem key={role.id} role={role} />
              ))}
            </ul>
          </ContentCard>
        </motion.div>
      </SectionShell>
    </section>
  );
}
