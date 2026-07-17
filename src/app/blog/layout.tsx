import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import Link from 'next/link';

import { brandMonoFont, brandSansFont } from '@/lib/fonts/brand';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Blog',
};

/**
 * Brand shell for the Blog (ADR-0011): the iamnick brand's first shipped
 * surface. No live canvas, no carnival styling — the root SiteNav stands down
 * on /blog and this header is the chrome.
 */
export default function BlogLayout({ children }: PropsWithChildren) {
  return (
    <div className={cn(brandSansFont.variable, brandMonoFont.variable, 'brand-surface min-h-dvh')}>
      <header className="mx-auto flex w-full max-w-3xl items-baseline justify-between px-6 pt-brand-m">
        {/* The wordmark is the one carnival-red bleed on brand surfaces — the
            logo stays identical everywhere (Nick's ruling, docs/brand/brand.md). */}
        <Link
          href="/"
          className="font-expressive text-[15px] font-semibold tracking-tight text-text-primary transition-colors hover:text-accent"
        >
          iamnick<span className="text-accent">.dev</span>
        </Link>
        <Link
          href="/blog"
          className="font-brand-mono text-brand-xs uppercase tracking-[0.2em] text-brand-fog transition-colors hover:text-brand-steel"
        >
          blog
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 pb-brand-2xl pt-brand-xl">{children}</main>
    </div>
  );
}
