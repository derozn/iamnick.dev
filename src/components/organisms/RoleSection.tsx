'use client';

import { useReducedMotion } from 'motion/react';
import { motion } from 'motion/react';

import { type Role } from '@/content/cv';
import { formatYearMonth } from '@/lib/formatDate';
import { cn } from '@/lib/cn';

interface RoleSectionProps {
  role: Role;
  /** Position in the featured list (0-based) — drives alternating card alignment. */
  index: number;
}

function TechChip({ label }: { label: string }) {
  return (
    <li className="rounded-2 border border-accent/30 px-3 py-1 font-functional text-[12px] text-accent/80">
      {label}
    </li>
  );
}

export function RoleSection({ role, index }: RoleSectionProps) {
  const reduced = useReducedMotion();
  const headingId = `role-${role.id}`;
  const isOdd = index % 2 !== 0;

  const dateRange = `${formatYearMonth(role.start)} – ${formatYearMonth(role.end)}`;

  return (
    <section aria-labelledby={headingId} className="relative flex min-h-screen w-full items-center">
      {/* Max-width container — card occupies roughly half the width on desktop */}
      <div
        className={cn(
          'mx-auto w-full max-w-[1280px] px-5 py-16 md:px-10 md:py-24',
          'flex',
          isOdd ? 'justify-end' : 'justify-start',
        )}
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'w-full md:w-1/2',
            'rounded-3 bg-background-primary/70 backdrop-blur-md',
            'border border-border-primary/10',
            'p-6 md:p-10',
          )}
        >
          {/* Kicker */}
          <p className="mb-2 font-expressive text-[12px] font-semibold uppercase tracking-widest text-accent">
            {role.location} · {dateRange}
          </p>

          {/* Heading */}
          <h2
            id={headingId}
            className="font-expressive text-[28px] font-semibold leading-tight text-text-primary md:text-[36px]"
          >
            {role.company}
          </h2>

          <p className="mt-1 font-expressive text-[16px] font-semibold text-text-primary/70 md:text-[18px]">
            {role.title}
          </p>

          {role.promotion && (
            <p className="mt-2 font-functional text-[12px] italic text-accent/60">
              {role.promotion}
            </p>
          )}

          {/* Blurb */}
          <p className="mt-4 text-[14px] leading-relaxed text-text-primary/70">{role.blurb}</p>

          {/* Highlights */}
          <ul className="mt-5 space-y-2">
            {role.highlights.map((highlight, i) => (
              <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-text-primary/80">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          {/* Tech chips */}
          <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-2">
            {role.tech.map((t) => (
              <TechChip key={t} label={t} />
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
