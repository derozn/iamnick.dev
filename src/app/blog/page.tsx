import type { Metadata } from 'next';
import Link from 'next/link';

import { publishedPosts } from '@/content/blog';

const BLOG_DESCRIPTION =
  'Mostly how this site gets built with AI agents. Sometimes whatever else is in my head. Dead ends included.';

export const metadata: Metadata = {
  title: 'Blog',
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: "Nick's rambles" }] },
  },
  openGraph: {
    title: 'Blog · iamnick.dev',
    description: BLOG_DESCRIPTION,
    url: '/blog',
    type: 'website',
  },
};

/** Stable "fig." number: oldest Post is fig. 01, appended as Posts publish. */
const figNumber = (index: number) => String(publishedPosts.length - index).padStart(2, '0');

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function BlogIndexPage() {
  return (
    <>
      <p className="font-brand-mono text-brand-xs uppercase tracking-[0.22em] text-brand-red-bright">
        Nick&rsquo;s rambles
      </p>
      <h1 className="mt-brand-2xs text-brand-3xl font-semibold leading-[var(--text-brand-3xl--line-height)] tracking-tight">
        Notes, <span className="brand-underline">measured twice</span>.
      </h1>
      <p className="mt-brand-s max-w-[52ch] text-brand-base leading-[var(--text-brand-base--line-height)] text-brand-fog">
        Mostly how this site gets built with AI agents. Sometimes whatever else is in my head. Dead
        ends included.
      </p>

      <ul className="mt-brand-xl">
        {publishedPosts.map((post, index) => (
          <li key={post.slug} className="border-t border-brand-hairline">
            <Link href={post.permalink} className="group block py-brand-m">
              <p className="font-brand-mono text-brand-xs text-brand-fog">
                <span className="text-brand-red-bright">fig. {figNumber(index)}</span>
                {' · '}
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {' · '}
                {Math.max(1, Math.round(post.metadata.readingTime))} min
              </p>
              <h2 className="mt-brand-3xs text-brand-xl font-semibold leading-[var(--text-brand-xl--line-height)] tracking-tight transition-colors group-hover:text-brand-red-bright">
                {post.title}
              </h2>
              <p className="mt-brand-2xs max-w-[58ch] text-brand-sm leading-relaxed text-brand-fog">
                {post.description}
              </p>
              {post.tags.length > 0 && (
                <p className="mt-brand-2xs font-brand-mono text-brand-xs text-brand-fog">
                  {post.tags.map((tag) => `#${tag}`).join('  ')}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
