import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

/**
 * iamnick brand (Blueprint) faces — docs/brand/brand.md. Loaded only by brand
 * surfaces (the blog layout), never by the carnival shell. `next/font/google`
 * self-hosts at build time — no client-side Google calls.
 *
 *  - IBM Plex Sans → display + prose
 *  - IBM Plex Mono → meta: dates, tags, reading time, spec labels
 */
// `-src`-suffixed so the @theme tokens (--font-brand-*) layer fallbacks on top.
export const brandSansFont = IBM_Plex_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-brand-sans-src',
});

export const brandMonoFont = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-brand-mono-src',
});
