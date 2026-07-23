import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BlogPostingJsonLd } from '@/components/blog/BlogPostingJsonLd';
import { MdxContent } from '@/components/blog/MdxContent';
import { publishedPosts, routablePosts } from '@/content/blog';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/** Production: published Posts only. `next dev` also routes Drafts for preview
 *  (routablePosts). Either way an unknown slug 404s (dynamicParams = false). */
export function generateStaticParams() {
  return routablePosts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = routablePosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    // A Draft only reaches here in dev; keep it out of any index if ever crawled.
    ...(post.draft && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: post.permalink,
      types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: "Nick's rambles" }] },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: post.permalink,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: ['Nick de Rozarieux'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = routablePosts.find((p) => p.slug === slug);
  if (!post) notFound();

  // fig. number and prev/next live on the published sequence; a Draft preview has
  // neither (it never joins the public order).
  const publishedIndex = publishedPosts.findIndex((p) => p.slug === slug);
  const figNumber =
    publishedIndex >= 0 ? String(publishedPosts.length - publishedIndex).padStart(2, '0') : '--';
  const newer = publishedIndex > 0 ? publishedPosts[publishedIndex - 1] : undefined;
  const older =
    publishedIndex >= 0 && publishedIndex < publishedPosts.length - 1
      ? publishedPosts[publishedIndex + 1]
      : undefined;

  return (
    <article>
      {post.draft ? (
        <p className="mb-brand-l border-l-2 border-brand-red bg-brand-panel px-brand-s py-brand-2xs font-brand-mono text-brand-xs text-brand-red-bright">
          Draft. Visible only in local development, never in production.
        </p>
      ) : (
        <BlogPostingJsonLd post={post} />
      )}
      <header>
        <p className="font-brand-mono text-brand-xs uppercase tracking-[0.22em] text-brand-fog">
          <span className="normal-case text-brand-red-bright">fig. {figNumber}</span>
          {' · '}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {' · '}
          {Math.max(1, Math.round(post.metadata.readingTime))} min
          {post.tags.length > 0 && (
            <>
              {' · '}
              {post.tags.map((tag, i) => (
                <span key={tag}>
                  {i > 0 && ', '}
                  <Link
                    href={`/blog/tags/${tag}`}
                    className="normal-case hover:text-brand-red-bright"
                  >
                    {tag}
                  </Link>
                </span>
              ))}
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

      {publishedIndex >= 0 && (older || newer) && (
        <nav
          aria-label="More Posts"
          className="mt-brand-2xl flex justify-between gap-brand-m border-t border-brand-hairline pt-brand-m font-brand-mono text-brand-sm"
        >
          <div>
            {older && (
              <Link
                href={older.permalink}
                className="group text-brand-fog hover:text-brand-red-bright"
              >
                <span aria-hidden>←</span> older
                <span className="mt-brand-3xs block text-brand-white group-hover:text-brand-red-bright">
                  {older.title}
                </span>
              </Link>
            )}
          </div>
          <div className="text-right">
            {newer && (
              <Link
                href={newer.permalink}
                className="group text-brand-fog hover:text-brand-red-bright"
              >
                newer <span aria-hidden>→</span>
                <span className="mt-brand-3xs block text-brand-white group-hover:text-brand-red-bright">
                  {newer.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
