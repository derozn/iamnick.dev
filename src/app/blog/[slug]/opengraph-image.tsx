import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

// Satori needs the real font binaries (it cannot read next/font's self-hosted
// Plex). We vendor the exact faces the card uses as local woff, the same way the
// carnival wordmark ships Montserrat. Read once at module load (build time).
const fontsDir = join(process.cwd(), 'src/assets/fonts');
const montserrat600 = readFileSync(join(fontsDir, 'montserrat-v14-latin-600.woff'));
const plexSans600 = readFileSync(join(fontsDir, 'ibm-plex-sans-latin-600-normal.woff'));
const plexMono500 = readFileSync(join(fontsDir, 'ibm-plex-mono-latin-500-normal.woff'));

const KICKER = "Nick's rambles".toUpperCase();

/**
 * Per-Post social card — Blueprint brand, deliberately not the carnival poster
 * (ADR-0011 brand boundary). Slate ground, steel drawing margin, redline tick,
 * Montserrat wordmark with the red `.dev`, Plex Sans title, Plex Mono labels.
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

  const mono = {
    fontFamily: 'Plex Mono',
    fontWeight: 500,
    fontSize: 22,
  } as const;

  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '76px 80px',
        backgroundColor: slate,
        color: white,
        fontFamily: 'Plex Sans',
      }}
    >
      {/* drawing margin — a steel construction rule down the left */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '40px',
          width: '2px',
          backgroundColor: steelFaint,
        }}
      />

      {/* top row — wordmark + fig. label */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', fontFamily: 'Montserrat', fontWeight: 600, fontSize: 34 }}>
          <span style={{ color: white }}>iamnick</span>
          <span style={{ color: redBright }}>.dev</span>
        </div>
        <div style={{ ...mono, color: fog, letterSpacing: '0.18em' }}>{`FIG. ${fig}`}</div>
      </div>

      {/* title block */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ ...mono, color: redBright, letterSpacing: '0.28em', marginBottom: '22px' }}>
          {KICKER}
        </div>
        <div
          style={{
            display: 'flex',
            width: '1000px',
            fontFamily: 'Plex Sans',
            fontWeight: 600,
            fontSize: 74,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: white,
          }}
        >
          {title}
        </div>
        {/* redline tick — one deliberate red mark */}
        <div
          style={{
            display: 'flex',
            width: '132px',
            height: '8px',
            backgroundColor: red,
            marginTop: '30px',
          }}
        />
      </div>

      {/* bottom row — date + reading time */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...mono,
          color: fog,
        }}
      >
        <div style={{ display: 'flex' }}>{date}</div>
        <div style={{ display: 'flex' }}>{readingTime}</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Montserrat', data: montserrat600, weight: 600, style: 'normal' },
        { name: 'Plex Sans', data: plexSans600, weight: 600, style: 'normal' },
        { name: 'Plex Mono', data: plexMono500, weight: 500, style: 'normal' },
      ],
    },
  );
}
