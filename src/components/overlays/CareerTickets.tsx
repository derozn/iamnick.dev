'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { roles, type Role } from '@/content/cv';
import { formatYearMonth } from '@/lib/formatDate';

/**
 * CareerTickets — the Career booth as a deck of letterpress carnival tickets you
 * shuffle through one role at a time. First step of the HUD overhaul toward the
 * aged sideshow-poster look (see horror-carnival-hud-spec): bone stock, oxblood +
 * brass spot inks, double-rule frame, period type (Rye / IM Fell).
 *
 * Condensed ticket face (dates · company · title · blurb · tech); "read the bill"
 * expands a role's highlights. A prev/next stepper (‹ ›) + ← → keys cycle the deck,
 * which wraps. Purely presentational over the `roles` content model.
 */

const EASE = [0.22, 0.61, 0.27, 1] as const;
const FLEURON = '❦'; // ❦

/** Newest role first — the deck opens on the current job. */
const DECK: Role[] = [...roles].sort((a, b) => (a.start < b.start ? 1 : -1));

/** Minimal roman numerals for the deck counter (deck is small). */
function roman(n: number): string {
  const table: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let out = '';
  for (const [value, sym] of table) {
    while (n >= value) {
      out += sym;
      n -= value;
    }
  }
  return out;
}

export function CareerTickets() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1); // travel direction for the swap animation
  const [expanded, setExpanded] = useState(false);
  const total = DECK.length;

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setExpanded(false);
      setIndex((i) => (i + step + total) % total);
    },
    [total],
  );

  // ← / → shuffle the deck while the booth is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const role = DECK[index];
  const dates = `${formatYearMonth(role.start)} – ${formatYearMonth(role.end)}`;

  const variants = {
    enter: (d: number) => ({
      opacity: 0,
      x: reduce ? 0 : d > 0 ? 44 : -44,
      rotate: reduce ? 0 : d > 0 ? 1.5 : -1.5,
    }),
    center: { opacity: 1, x: 0, rotate: 0 },
    exit: (d: number) => ({
      opacity: 0,
      x: reduce ? 0 : d > 0 ? -32 : 32,
      rotate: reduce ? 0 : d > 0 ? -1.2 : 1.2,
    }),
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      {/* Section header — a bone placard so the ink reads over the dark midway
          (a bare header floated dark-on-dark against the dimmed backdrop). */}
      <header className="ticket-frame halftone mb-7 rounded-[4px] px-9 py-3.5 text-center">
        <p className="font-fell-sc letterpress text-[14px] tracking-[0.32em] text-brass-text">
          the bill
        </p>
        <h2 className="font-rye letterpress mt-1.5 text-[42px] leading-none text-ink">Career</h2>
      </header>

      {/* The deck */}
      <div className="relative w-full" style={{ minHeight: 296 }}>
        {/* Peek tickets behind, to read as a stack */}
        <div
          aria-hidden
          className="ticket-frame absolute inset-x-3 top-2 bottom-0 rounded-[4px] opacity-60"
          style={{ transform: 'translateY(14px) rotate(-1.4deg)' }}
        />
        <div
          aria-hidden
          className="ticket-frame absolute inset-x-1.5 top-1 bottom-0 rounded-[4px] opacity-80"
          style={{ transform: 'translateY(7px) rotate(0.9deg)' }}
        />

        <AnimatePresence mode="wait" custom={dir}>
          <motion.article
            key={role.id}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
            aria-label={`${role.company} — ${role.title}`}
            className="ticket-frame ticket-perf halftone relative z-10 rounded-[4px] py-5 pl-10 pr-6"
          >
            <p className="font-fell-sc letterpress text-[11px] tracking-[0.22em] text-brass-text">
              {dates}
            </p>
            <h3 className="font-rye letterpress mt-1.5 text-[24px] leading-tight text-ink">
              {role.company}
            </h3>
            <p className="font-fell mt-0.5 text-[15px] italic text-oxblood">{role.title}</p>
            {role.promotion && (
              <p className="font-fell mt-1 text-[12px] italic leading-snug text-ink-soft">
                {role.promotion}
              </p>
            )}

            <p className="font-fell mt-3 text-[12.5px] tracking-[0.18em] text-ink-soft">
              {FLEURON}&nbsp;&nbsp;{role.location}&nbsp;&nbsp;{FLEURON}
            </p>

            <p className="font-fell mt-3 text-[14px] italic leading-relaxed text-ink">
              {role.blurb}
            </p>

            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
              {role.tech.map((t) => (
                <li
                  key={t}
                  className="font-fell rounded-[2px] border border-ink-soft/40 px-2 py-0.5 text-[11px] text-brass-text"
                >
                  {t}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="font-fell-sc letterpress mt-4 text-[12px] tracking-[0.16em] text-oxblood transition-colors hover:text-oxblood-bright"
            >
              {expanded ? `fold the bill ${FLEURON}` : `read the bill ${FLEURON}`}
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.ul
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {role.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="font-fell flex gap-2 text-[13px] leading-relaxed text-ink"
                    >
                      <span aria-hidden className="text-brass-text">
                        {FLEURON}
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Stepper */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous role"
          className="font-rye text-[42px] leading-none text-brass-text transition-colors hover:text-oxblood"
        >
          &#8249;
        </button>
        <span className="font-fell-sc letterpress text-[15px] tracking-[0.2em] text-ink-soft">
          {FLEURON}&nbsp; {roman(index + 1)} of {roman(total)} &nbsp;{FLEURON}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next role"
          className="font-rye text-[42px] leading-none text-brass-text transition-colors hover:text-oxblood"
        >
          &#8250;
        </button>
      </div>
    </div>
  );
}
