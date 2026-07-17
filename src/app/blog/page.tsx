import Link from 'next/link';

import { publishedPosts } from '@/content/blog';

/** Stable "fig." number: oldest Post is fig. 01, appended as Posts publish. */
const figNumber = (index: number) => String(publishedPosts.length - index).padStart(2, '0');

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function BlogIndexPage() {
  return (
    <>
      <p className="font-brand-mono text-brand-xs uppercase tracking-[0.22em] text-brand-steel">
        Build journal
      </p>
      <h1 className="mt-brand-2xs text-brand-3xl font-semibold leading-[var(--text-brand-3xl--line-height)] tracking-tight">
        Notes, <span className="brand-underline">measured twice</span>.
      </h1>
      <p className="mt-brand-s max-w-[52ch] text-brand-base leading-[var(--text-brand-base--line-height)] text-brand-fog">
        How this site is built with agentic workflows — decisions dimensioned, dead ends included.
      </p>

      <ul className="mt-brand-xl">
        {publishedPosts.map((post, index) => (
          <li key={post.slug} className="border-t border-brand-hairline">
            <Link href={post.permalink} className="group block py-brand-m">
              <p className="font-brand-mono text-brand-xs text-brand-fog">
                <span className="text-brand-steel">fig. {figNumber(index)}</span>
                {' — '}
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {' · '}
                {Math.max(1, Math.round(post.metadata.readingTime))} min
              </p>
              <h2 className="mt-brand-3xs text-brand-xl font-semibold leading-[var(--text-brand-xl--line-height)] tracking-tight transition-colors group-hover:text-brand-steel">
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
