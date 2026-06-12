import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Nick de Rozarieux — Lead Software Engineer · Full-Stack';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#070810',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Accent rule at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: '#4cc9f0',
        }}
      />

      {/* Accent rule at bottom edge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'rgba(76,201,240,0.3)',
        }}
      />

      <p
        style={{
          color: '#4cc9f0',
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          margin: '0 0 24px',
        }}
      >
        iamnick.dev
      </p>

      <h1
        style={{
          color: '#d6d6d6',
          fontSize: '72px',
          fontWeight: 700,
          lineHeight: 1.1,
          margin: '0 0 20px',
        }}
      >
        NICK DE ROZARIEUX
      </h1>

      <p
        style={{
          color: '#4cc9f0',
          fontSize: '28px',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Lead Software Engineer · Full-Stack
      </p>
    </div>,
    { ...size },
  );
}
