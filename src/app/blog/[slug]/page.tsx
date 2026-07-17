import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MdxContent } from '@/components/blog/MdxContent';
import { publishedPosts } from '@/content/blog';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/** Published Posts only — a Draft slug is a 404, never a page. */
export function generateStaticParams() {
  return publishedPosts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const index = publishedPosts.findIndex((post) => post.slug === slug);
  if (index === -1) notFound();

  const post = publishedPosts[index];
  // publishedPosts is newest-first: "newer" sits earlier in the list.
  const newer = index > 0 ? publishedPosts[index - 1] : undefined;
  const older = index < publishedPosts.length - 1 ? publishedPosts[index + 1] : undefined;

  return (
    <article>
      <header>
        <p className="font-brand-mono text-brand-xs uppercase tracking-[0.22em] text-brand-fog">
          <span className="normal-case text-brand-steel">
            fig. {String(publishedPosts.length - index).padStart(2, '0')}
          </span>
          {' — '}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {' · '}
          {Math.max(1, Math.round(post.metadata.readingTime))} min
          {post.tags.length > 0 && (
            <>
              {' '}
              {' · '} {post.tags.join(', ')}
            </>
          )}
        </p>
        <h1 className="mt-brand-xs text-brand-3xl font-semibold leading-[var(--text-brand-3xl--line-height)] tracking-tight">
          {post.title}
        </h1>
      </header>

      <div className="brand-prose mt-brand-l">
        <MdxContent code={post.code} />
      </div>

      <nav
        aria-label="More Posts"
        className="mt-brand-2xl flex justify-between gap-brand-m border-t border-brand-hairline pt-brand-m font-brand-mono text-brand-sm"
      >
        <div>
          {older && (
            <Link href={older.permalink} className="group text-brand-fog hover:text-brand-steel">
              <span aria-hidden>←</span> older
              <span className="mt-brand-3xs block text-brand-white group-hover:text-brand-steel">
                {older.title}
              </span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {newer && (
            <Link href={newer.permalink} className="group text-brand-fog hover:text-brand-steel">
              newer <span aria-hidden>→</span>
              <span className="mt-brand-3xs block text-brand-white group-hover:text-brand-steel">
                {newer.title}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
