'use client';

import { PropsWithChildren, useSyncExternalStore } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, type Variants } from 'motion/react';

import { cn } from '@/lib/cn';

const EASE = [0.22, 0.61, 0.27, 1] as const;
const MAX_TILT_DEG = 2.5;

interface MotionCardProps {
  /** Layout classes for the outer (entrance) wrapper — width, alignment. */
  className?: string;
  /** Classes for the inner HUD panel — padding, typography context. */
  cardClassName?: string;
  /** Mirrors the HUD corner cuts for right-aligned cards. */
  flip?: boolean;
  /** Animate on mount (hero) instead of when scrolled into view. */
  immediate?: boolean;
}

function subscribeFinePointer(onChange: () => void) {
  const mq = window.matchMedia('(pointer: fine)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** True once hydrated on a fine-pointer (mouse/trackpad) device. */
function useFinePointer() {
  return useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia('(pointer: fine)').matches,
    () => false,
  );
}

/**
 * MotionCard — HUD glass panel that enters in 3-D perspective and, on
 * fine-pointer devices, parallax-tilts toward the cursor while in view.
 *
 * Entrance: opacity 0 / rotateX 8° (4° touch) / y 40 / z -60 → flat, with
 * children (wrapped in MotionItem) staggering in behind the card chrome.
 * Tilt is driven entirely by motion values (no React re-renders) and is
 * spring-damped to ±2.5°. Everything degrades to opacity-only under
 * prefers-reduced-motion.
 */
export function MotionCard({
  children,
  className,
  cardClassName,
  flip = false,
  immediate = false,
}: PropsWithChildren<MotionCardProps>) {
  const reduced = useReducedMotion() ?? false;
  const fine = useFinePointer();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const tiltX = useSpring(rawX, { stiffness: 120, damping: 18, mass: 0.4 });
  const tiltY = useSpring(rawY, { stiffness: 120, damping: 18, mass: 0.4 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !fine) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rawY.set(px * MAX_TILT_DEG * 2);
    rawX.set(py * -MAX_TILT_DEG * 2);
  };

  const resetTilt = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const cardVariants: Variants = reduced
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.5 } },
      }
    : {
        hidden: { opacity: 0, rotateX: fine ? 8 : 4, y: 40, z: -60 },
        show: {
          opacity: 1,
          rotateX: 0,
          y: 0,
          z: 0,
          transition: {
            duration: 0.7,
            ease: EASE,
            staggerChildren: 0.06,
            delayChildren: 0.1,
          },
        },
      };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      {...(immediate
        ? { animate: 'show' }
        : { whileInView: 'show', viewport: { once: true, margin: '-15%' } })}
      style={{ transformPerspective: 1200 }}
      className={className}
    >
      <motion.div
        style={{ transformPerspective: 1200, rotateX: tiltX, rotateY: tiltY }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        className={cn('hud-card h-full p-6 md:p-10', flip && 'hud-flip', cardClassName)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const itemVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

interface MotionItemProps {
  className?: string;
  /** Rendered element — 'li' for list contexts. */
  as?: 'div' | 'li';
}

/**
 * MotionItem — staggered child block inside a MotionCard. Inherits the parent's
 * variant state, so it needs no own trigger props.
 */
export function MotionItem({
  children,
  className,
  as = 'div',
}: PropsWithChildren<MotionItemProps>) {
  const reduced = useReducedMotion() ?? false;
  const Tag = as === 'li' ? motion.li : motion.div;

  return (
    <Tag variants={reduced ? itemVariantsReduced : itemVariants} className={className}>
      {children}
    </Tag>
  );
}
