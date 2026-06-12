import { PropsWithChildren } from 'react';

import { cn } from '@/lib/cn';

interface SectionShellProps {
  className?: string;
}

/**
 * Shared section wrapper — consistent vertical padding and max-width centering.
 * Organisms compose this for consistent spacing without duplicating class strings.
 */
export function SectionShell({ children, className }: PropsWithChildren<SectionShellProps>) {
  return (
    <div className={cn('mx-auto w-full max-w-[1280px] px-5 py-16 md:px-10 md:py-24', className)}>
      {children}
    </div>
  );
}

/**
 * Translucent content card — sits over the 3-D canvas with readable contrast.
 */
export function ContentCard({ children, className }: PropsWithChildren<SectionShellProps>) {
  return (
    <div
      className={cn(
        'rounded-3 bg-background-primary/70 backdrop-blur-md',
        'border border-border-primary/10',
        'p-6 md:p-10',
        'neon-border',
        className,
      )}
    >
      {children}
    </div>
  );
}
