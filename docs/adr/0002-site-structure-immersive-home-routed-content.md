# 0002 — Immersive carnival home + conventional routed pages behind a global nav

The site is no longer a single scroll page. The Dark Carnival is the homepage (`/`) — the immersive 3D Midway. Everything text-heavy (the blog, and any future reading content) lives **outside** the 3D shell as conventional, fast, statically-generated routes that keep the neon-noir styling but mount **no live WebGL canvas**, reached through a traditional global navigation menu. The blog is authored as **MDX files in `content/blog/`** with frontmatter, statically generated per slug.

## Why

Long-form reading comfort, Core Web Vitals (LCP/CLS), and crawlability all suffer behind a live 3D canvas. The blog is also the site's primary indexable-text / SEO surface, so it must be lean. A conventional menu is what visitors and recruiters expect, and it makes the written content discoverable.

## Consequences

- A persistent global header/nav appears across the site; on the carnival home it is an unobtrusive overlay so it does not break immersion.
- The 3D canvas mounts only on the carnival home route — three.js stays entirely out of blog/content bundles.
- Requires a content pipeline (MDX + frontmatter + `generateStaticParams`) and per-post SEO: metadata from frontmatter, auto OG image (reusing the `opengraph-image` ImageResponse approach), `Article`/`BlogPosting` JSON-LD, sitemap entries, and an RSS feed.
