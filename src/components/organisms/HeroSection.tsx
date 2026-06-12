'use client';

import { motion, useReducedMotion } from 'motion/react';

import { profile } from '@/content/cv';

/** First sentence of shortBio — used as the tagline. */
const tagline = profile.shortBio.split('. ')[0] + '.';

function ScrollCue() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="mt-10 flex justify-center md:justify-start">
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
 * The LCP element is server-rendered text; only the scroll cue is a client motion node.
 * Text is anchored bottom-left on desktop, centred on mobile.
 */
export function HeroSection() {
  return (
    <section
      aria-label="Introduction"
      data-journey-stop="hero"
      className="relative flex min-h-svh w-full items-end justify-center pb-16 text-center md:justify-start md:pb-20 md:text-left"
    >
      <div className="max-w-[1280px] w-full mx-auto px-5 md:px-10">
        <div className="rounded-3 bg-background-primary/70 backdrop-blur-md inline-block p-6 md:p-10 max-w-2xl">
          <p className="mb-3 font-expressive text-[14px] font-semibold uppercase tracking-widest text-accent">
            {profile.location}
          </p>

          <h1 className="font-expressive text-[36px] font-semibold leading-[1.1] text-text-primary md:text-[56px] lg:text-[64px]">
            {profile.name}
          </h1>

          <p className="mt-3 font-expressive text-[18px] font-semibold text-accent md:text-[24px]">
            {profile.headline}
          </p>

          <p className="mt-4 max-w-prose text-[14px] leading-relaxed text-text-primary/80 md:text-[16px]">
            {tagline}
          </p>

          <ScrollCue />
        </div>
      </div>
    </section>
  );
}
