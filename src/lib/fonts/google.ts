import { Rye, IM_Fell_English, IM_Fell_English_SC } from 'next/font/google';

/**
 * Period faces for the letterpress carnival HUD (see horror-carnival-hud-spec).
 * `next/font/google` self-hosts these at build time — no client-side Google calls.
 *
 *  - Rye               → wood-type display: company names, big numerals, act labels
 *  - IM Fell English   → antique body, roman + italic: blurbs, meta, highlights
 *  - IM Fell English SC → small-caps: kickers and labels
 */
// Raw font variables are `-src`-suffixed so the @theme tokens (--font-rye etc.)
// can layer fallbacks on top without referencing themselves.
export const ryeFont = Rye({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rye-src',
});

export const fellFont = IM_Fell_English({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fell-src',
});

export const fellScFont = IM_Fell_English_SC({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fell-sc-src',
});
