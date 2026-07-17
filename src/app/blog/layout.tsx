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
        <Link
          href="/"
          className="text-brand-sm font-semibold tracking-tight transition-colors hover:text-brand-steel"
        >
          <span className="font-normal text-brand-fog">iam</span>nick
          <span className="text-brand-steel">.</span>dev
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
