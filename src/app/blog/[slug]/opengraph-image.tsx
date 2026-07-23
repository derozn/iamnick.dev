import { ImageResponse } from 'next/og';

import { publishedPosts } from '@/content/blog';

// Default Node runtime: the card is pre-rendered per Post via generateStaticParams,
// which Next forbids under the edge runtime (and Node is the platform default now).
export const alt = "A Post from Nick's rambles";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Pre-render one card per published Post; a Draft slug never gets an image. */
export function generateStaticParams() {
  return publishedPosts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

/**
 * Per-Post social card — Blueprint brand, deliberately not the carnival poster
 * (ADR-0011 brand boundary). Slate ground, steel drawing margin, redline
 * underline, wordmark with the red `.dev`. Satori bundles no brand face, so the
 * palette and rules carry the identity (the same compromise the root OG made).
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = publishedPosts.find((p) => p.slug === slug);
  const title = post?.title ?? 'Blog';

  const slate = '#14171c';
  const white = '#edf0f3';
  const fog = '#9aa3ad';
  const red = '#c50201';
  const redBright = '#f0463c';
  const steelFaint = 'rgba(127, 168, 217, 0.16)';

  const fig = post
    ? String(publishedPosts.length - publishedPosts.indexOf(post)).padStart(2, '0')
    : '00';
  const date = post
    ? new Date(post.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';
  const readingTime = post ? `${Math.max(1, Math.round(post.metadata.readingTime))} min read` : '';

  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        backgroundColor: slate,
        color: white,
        fontFamily: 'sans-serif',
      }}
    >
      {/* drawing margin — a steel construction rule down the left */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '48px',
          width: '2px',
          backgroundColor: steelFaint,
        }}
      />

      {/* top row — wordmark + fig. label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 30,
        }}
      >
        <div style={{ display: 'flex', fontWeight: 700, letterSpacing: '-0.01em' }}>
          <span style={{ color: white }}>iamnick</span>
          <span style={{ color: redBright }}>.dev</span>
        </div>
        <div style={{ display: 'flex', color: fog, letterSpacing: '0.2em', fontSize: 22 }}>
          FIG. {fig}
        </div>
      </div>

      {/* title block */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            color: redBright,
            fontSize: 24,
            letterSpacing: '0.24em',
            marginBottom: 24,
          }}
        >
          NICK&apos;S RAMBLES
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 68,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '16ch',
          }}
        >
          {title}
        </div>
        {/* redline underline — one deliberate red mark */}
        <div
          style={{
            display: 'flex',
            width: '220px',
            height: '6px',
            backgroundColor: red,
            marginTop: '32px',
          }}
        />
      </div>

      {/* bottom row — date + reading time */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: fog,
          fontSize: 24,
        }}
      >
        <div style={{ display: 'flex' }}>{date}</div>
        <div style={{ display: 'flex' }}>{readingTime}</div>
      </div>
    </div>,
    { ...size },
  );
}
