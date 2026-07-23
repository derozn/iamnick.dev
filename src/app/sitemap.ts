import type { MetadataRoute } from 'next';

import { publishedPosts } from '@/content/blog';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  // Drafts never appear (publishedPosts is the single Draft-filtered read). Tag
  // URLs join at Stage 5 once the tag pages exist — no entry points at a 404.
  const posts: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${SITE_URL}${post.permalink}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const blogIndexModified = publishedPosts.length
    ? new Date(publishedPosts[0].updated ?? publishedPosts[0].date)
    : new Date();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: blogIndexModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts,
  ];
}
