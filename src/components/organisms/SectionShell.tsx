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
