import type { Post } from '@/content/blog';
import { SITE_URL } from '@/lib/site';

/**
 * BlogPostingJsonLd — per-Post structured data (schema.org BlogPosting),
 * injected into the Post page. Server component; no client JS.
 * Mirrors the Person schema in @/components/cv/JsonLd. Reads a single Post
 * from publishedPosts (the caller already resolved it), never the content
 * layer directly.
 */
export function BlogPostingJsonLd({ post }: { post: Post }) {
  const url = `${SITE_URL}${post.permalink}`;
  const author = {
    '@type': 'Person',
    name: 'Nick de Rozarieux',
    url: SITE_URL,
  } as const;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author,
    publisher: author,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: `${url}/opengraph-image`,
    ...(post.tags.length > 0 && { keywords: post.tags.join(', ') }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
