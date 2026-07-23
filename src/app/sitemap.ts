import type { MetadataRoute } from 'next';

import { postsForTag, publishedPosts, publishedTags } from '@/content/blog';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  // Drafts never appear (publishedPosts is the single Draft-filtered read).
  const posts: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${SITE_URL}${post.permalink}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // One entry per Tag on a published Post; freshest Post in the Tag drives lastMod.
  const tags: MetadataRoute.Sitemap = publishedTags.map((tag) => {
    const newest = postsForTag(tag)[0];
    return {
      url: `${SITE_URL}/blog/tags/${tag}`,
      lastModified: new Date(newest.updated ?? newest.date),
      changeFrequency: 'weekly',
      priority: 0.5,
    };
  });

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
    ...tags,
  ];
}
