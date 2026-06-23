import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Nick de Rozarieux — Lead Software Engineer · Full-Stack';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Social share card — themed to the Dark Carnival / letterpress look (aged
 * sideshow poster: deep-night ground, warm stage-light glow, bone + brass +
 * oxblood inks, brand-red ".dev"). Satori has no period fonts bundled, so the
 * type renders in the default face — the palette + rules carry the theme.
 */
export default function OgImage() {
  const paper = '#e6dabd';
  const brass = '#caa24a';
  const oxblood = '#9a3b30';
  const accent = '#c50201';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '84px',
        // deep-night ground with a warm stage-light glow rising centre-left
        backgroundColor: '#0b0814',
        backgroundImage:
          'radial-gradient(120% 90% at 32% 12%, rgba(202,162,74,0.22), rgba(11,8,20,0) 55%), linear-gradient(160deg, #181126 0%, #0b0814 70%)',
      }}
    >
      {/* brass rules top + bottom — the poster frame */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: brass,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(202,162,74,0.4)',
        }}
      />

      <div
        style={{
          color: brass,
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '0.34em',
          textTransform: 'uppercase',
          margin: '0 0 26px',
          display: 'flex',
        }}
      >
        ❦&nbsp;&nbsp;Now Showing
      </div>

      <div
        style={{
          color: paper,
          fontSize: '78px',
          fontWeight: 800,
          lineHeight: 1.05,
          margin: '0 0 22px',
          display: 'flex',
        }}
      >
        Nick de Rozarieux
      </div>

      <div style={{ color: oxblood, fontSize: '30px', fontWeight: 600, display: 'flex' }}>
        Lead Software Engineer · Full-Stack
      </div>

      {/* wordmark, bottom-left */}
      <div
        style={{
          position: 'absolute',
          left: '84px',
          bottom: '64px',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: paper,
          display: 'flex',
        }}
      >
        iamnick<span style={{ color: accent }}>.dev</span>
      </div>
    </div>,
    { ...size },
  );
}
