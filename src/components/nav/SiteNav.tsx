'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS, type Attraction } from '@/components/three/synty/attractions';
import { MuteButton } from './MuteButton';

const EASE = [0.22, 0.61, 0.27, 1] as const;

/**
 * SiteNav — a Bruno-Simon-style burger menu (replacing the old nav-bar HUD).
 *
 * The burger opens a letterpress drawer listing the carnival's sections; clicking
 * one raises that section's content **in place** — the same panel its marker would
 * open — so you can quick-view About / Career / Projects / Contact without roaming
 * the scene. A game (ball-toss) needs the 3-D scene, so it routes through the
 * camera fly-in like its marker. The brand wordmark stays top-left, unchanged.
 *
 * The intro/landing isn't a destination, so it's omitted from the list.
 */
const ITEMS: Attraction[] = ATTRACTIONS.filter((a) => a.id !== 'intro');

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mode = useSceneStore((s) => s.mode);
  const open = useSceneStore((s) => s.open);
  const focus = useSceneStore((s) => s.focus);

  // While a content panel / game is up it owns the top-right (its own ✕), so hide
  // the burger to avoid overlapping it.
  const hidden = mode === 'viewing' || mode === 'playing';

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const select = (a: Attraction) => {
    setMenuOpen(false);
    // Quick view: raise the content panel in place (no camera roam). A game needs
    // the scene, so route it through focus() (fly in + play) like its marker.
    if (a.section.startsWith('game:')) focus(a.id);
    else open(a.id);
  };

  return (
    <>
      <a
        href="/"
        className="font-expressive fixed left-4 top-3 z-40 text-[15px] font-semibold tracking-tight text-text-primary transition-colors hover:text-accent"
      >
        iamnick<span className="text-accent">.dev</span>
      </a>

      {/* stays visible even while a panel/game owns the top-right ✕ (right-4);
          the mute lives one slot left at right-16 */}
      <MuteButton />

      {!hidden && (
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="paper-button fixed right-4 top-3 z-[47] flex h-10 w-10 items-center justify-center rounded-[4px]"
        >
          <span className="relative block h-4 w-5" aria-hidden>
            <motion.span
              className="absolute left-0 block h-[2px] w-full rounded bg-ink"
              style={{ top: 2, transformOrigin: 'center' }}
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 5 : 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            />
            <motion.span
              className="absolute left-0 block h-[2px] w-full rounded bg-ink"
              style={{ top: 7 }}
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="absolute left-0 block h-[2px] w-full rounded bg-ink"
              style={{ top: 12, transformOrigin: 'center' }}
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -5 : 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            />
          </span>
        </button>
      )}

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[45] cursor-default bg-background-primary/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.nav
              aria-label="Quick view"
              className="ticket-frame halftone fixed right-0 top-0 z-[46] flex h-full w-[clamp(260px,80vw,340px)] flex-col px-8 pb-10 pt-20"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <p className="font-fell-sc letterpress text-[13px] tracking-[0.3em] text-brass-text">
                quick view
              </p>
              <h2 className="font-rye letterpress mt-1 text-[30px] leading-none text-ink">
                The Midway
              </h2>
              <ul className="mt-8 flex flex-col gap-1">
                {ITEMS.map((a, i) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => select(a)}
                      className="group flex w-full items-baseline gap-3 rounded-[3px] py-2 text-left"
                    >
                      <span className="font-fell-sc text-[12px] text-brass-text">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-rye text-[24px] leading-tight text-ink transition-colors group-hover:text-oxblood">
                        {a.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
