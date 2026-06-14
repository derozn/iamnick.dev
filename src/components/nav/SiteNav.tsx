import { cn } from '@/lib/cn';

/**
 * SiteNav — persistent global navigation (ADR-0002). An unobtrusive overlay on
 * the carnival home so it doesn't break immersion; the same bar carries across
 * to the (future) routed blog/content pages.
 *
 * Targets: Home/Work/Contact are hash anchors to attractions on `/` (absolute,
 * so they also resolve from other routes); Blog is the only real route jump.
 * Play (ball-toss) and Blog don't exist yet — they ship in Phase 3 / Phase 2 —
 * so they render as disabled placeholders to keep the bar structurally complete
 * without dead links.
 */

interface NavLink {
  label: string;
  href: string;
  /** Not navigable yet — lands in a later phase. */
  soon?: boolean;
}

const LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/#work' },
  { label: 'Play', href: '/#play', soon: true }, // TODO(phase-3): ball-toss anchor
  { label: 'Blog', href: '/blog', soon: true }, // TODO(phase-2): blog route
  { label: 'Contact', href: '/#contact' },
];

const itemClass =
  'inline-flex min-h-[44px] items-center px-3 font-functional text-[14px] transition-colors';

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-2 md:px-8"
      >
        <a
          href="/"
          className="font-expressive text-[15px] font-semibold tracking-tight text-text-primary transition-colors hover:text-accent"
        >
          iamnick<span className="text-accent">.dev</span>
        </a>

        <ul className="flex items-center gap-0.5 rounded-3 bg-background-primary/40 px-1 backdrop-blur-sm sm:gap-1">
          {LINKS.map(({ label, href, soon }) =>
            soon ? (
              <li key={label}>
                <span
                  aria-disabled="true"
                  title="Coming soon"
                  className={cn(itemClass, 'cursor-not-allowed text-text-primary/30')}
                >
                  {label}
                </span>
              </li>
            ) : (
              <li key={label}>
                <a
                  href={href}
                  className={cn(itemClass, 'text-accent transition-colors hover:text-accent/70')}
                >
                  {label}
                </a>
              </li>
            ),
          )}
        </ul>
      </nav>
    </header>
  );
}
