import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { postsForTag, publishedTags } from '@/content/blog';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

/** One page per Tag that a published Post carries; a Draft-only Tag is a 404. */
export function generateStaticParams() {
  return publishedTags.map((tag) => ({ tag }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  if (!publishedTags.includes(tag)) return {};

  const canonical = `/blog/tags/${tag}`;
  const description = `Posts tagged ${tag} on Nick's rambles.`;
  return {
    title: `Tagged ${tag}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `Tagged ${tag} · iamnick.dev`,
      description,
      url: canonical,
      type: 'website',
    },
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const posts = postsForTag(tag);
  if (posts.length === 0) notFound();

  return (
    <>
      <p className="font-brand-mono text-brand-xs uppercase tracking-[0.22em] text-brand-red-bright">
        Tagged
      </p>
      <h1 className="mt-brand-2xs text-brand-3xl font-semibold leading-[var(--text-brand-3xl--line-height)] tracking-tight">
        <span className="brand-underline">#{tag}</span>
      </h1>
      <p className="mt-brand-s text-brand-base leading-[var(--text-brand-base--line-height)] text-brand-fog">
        {posts.length} {posts.length === 1 ? 'post' : 'posts'}.{' '}
        <Link href="/blog" className="text-brand-red-bright hover:underline">
          Back to all posts
        </Link>
      </p>

      <ul className="mt-brand-xl">
        {posts.map((post) => (
          <li key={post.slug} className="border-t border-brand-hairline">
            <Link href={post.permalink} className="group block py-brand-m">
              <p className="font-brand-mono text-brand-xs text-brand-fog">
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
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
