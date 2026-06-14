'use client';

import { type Role } from '@/content/cv';
import { formatYearMonth } from '@/lib/formatDate';
import { cn } from '@/lib/cn';
import { MotionCard, MotionItem } from './MotionCard';

interface RoleSectionProps {
  role: Role;
  /** Position in the featured list (0-based) — drives alternating card alignment. */
  index: number;
}

function TechChip({ label }: { label: string }) {
  return <li className="hud-chip px-3 py-1 font-functional text-[12px] text-accent/90">{label}</li>;
}

export function RoleSection({ role, index }: RoleSectionProps) {
  const headingId = `role-${role.id}`;
  const isOdd = index % 2 !== 0;

  const dateRange = `${formatYearMonth(role.start)} – ${formatYearMonth(role.end)}`;

  return (
    <section
      aria-labelledby={headingId}
      // Attraction id — 'travelex-lead' → 'travelex', 'lick-tech-lead' → 'lick', …
      data-attraction={role.id.split('-')[0]}
      className="relative flex min-h-screen w-full items-center"
    >
      {/* Max-width container — card occupies roughly half the width on desktop */}
      <div
        className={cn(
          'mx-auto w-full max-w-[1280px] px-5 py-16 md:px-10 md:py-24',
          'flex',
          isOdd ? 'justify-end' : 'justify-start',
        )}
      >
        <MotionCard flip={isOdd} className="w-full md:w-1/2">
          {/* Kicker */}
          <MotionItem className="mb-3 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-6 shrink-0 bg-accent/70" />
            <p className="font-expressive text-[12px] font-semibold uppercase tracking-widest text-accent">
              {role.location} · {dateRange}
            </p>
          </MotionItem>

          {/* Heading */}
          <MotionItem>
            <h2
              id={headingId}
              className="font-expressive text-[28px] font-semibold leading-tight text-text-primary md:text-[36px]"
            >
              {role.company}
            </h2>

            <p className="mt-1 font-expressive text-[16px] font-semibold text-accent/80 md:text-[18px]">
              {role.title}
            </p>

            {role.promotion && (
              <p className="mt-2 font-functional text-[12px] italic text-accent/60">
                {role.promotion}
              </p>
            )}
          </MotionItem>

          {/* Blurb */}
          <MotionItem>
            <p className="text-shadow-scrim mt-5 text-[14px] leading-relaxed text-text-primary/75">
              {role.blurb}
            </p>
          </MotionItem>

          {/* Highlights */}
          <MotionItem>
            <ul className="mt-6 space-y-3">
              {role.highlights.map((highlight, i) => (
                <li
                  key={i}
                  className="text-shadow-scrim flex gap-3 text-[14px] leading-relaxed text-text-primary/85"
                >
                  <span className="mt-[7px] h-1 w-3 shrink-0 bg-accent/80" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </MotionItem>

          {/* Tech chips */}
          <MotionItem>
            <ul aria-label="Technologies" className="mt-7 flex flex-wrap gap-2">
              {role.tech.map((t) => (
                <TechChip key={t} label={t} />
              ))}
            </ul>
          </MotionItem>
        </MotionCard>
      </div>
    </section>
  );
}
