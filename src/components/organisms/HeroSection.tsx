'use client';

import { motion, useReducedMotion } from 'motion/react';

import { profile } from '@/content/cv';
import { MotionCard, MotionItem } from './MotionCard';

/** First sentence of shortBio — used as the tagline. */
const tagline = profile.shortBio.split('. ')[0] + '.';

function ScrollCue() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="mt-8 flex justify-center md:justify-start">
      <motion.div
        animate={reduced ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-1 opacity-50"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-primary"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.div>
    </div>
  );
}

/**
 * HeroSection — 100svh opening section.
 * Compact HUD caption panel anchored bottom-left on desktop, centred on mobile.
 */
export function HeroSection() {
  return (
    <section
      aria-label="Introduction"
      data-journey-stop="hero"
      className="relative flex min-h-svh w-full items-end justify-center pb-16 text-center md:justify-start md:pb-20 md:text-left"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-10">
        <MotionCard
          immediate
          className="inline-block w-full max-w-md"
          cardClassName="p-6 md:p-8 [--hud-cut:16px]"
        >
          <MotionItem className="mb-3 flex items-center justify-center gap-3 md:justify-start">
            <span aria-hidden="true" className="h-px w-6 shrink-0 bg-accent/70" />
            <p className="font-expressive text-[14px] font-semibold uppercase tracking-widest text-accent">
              {profile.location}
            </p>
          </MotionItem>

          <MotionItem>
            <h1 className="font-expressive text-[36px] font-semibold leading-[1.1] text-text-primary md:text-[44px] lg:text-[48px]">
              {profile.name}
            </h1>
          </MotionItem>

          <MotionItem>
            <p className="mt-3 font-expressive text-[18px] font-semibold text-accent md:text-[20px]">
              {profile.headline}
            </p>
          </MotionItem>

          <MotionItem>
            <p className="text-shadow-scrim mt-4 max-w-prose text-[14px] leading-relaxed text-text-primary/80 md:line-clamp-1 md:text-[16px]">
              {tagline}
            </p>
          </MotionItem>

          <ScrollCue />
        </MotionCard>
      </div>
    </section>
  );
}
