import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { PropsWithChildren } from 'react';

import { montserratFont, openSansFont } from '@/lib/fonts/local';
import { ryeFont, fellFont, fellScFont } from '@/lib/fonts/google';
import { JsonLd } from '@/components/cv/JsonLd';
import { SiteNav } from '@/components/nav/SiteNav';
import { cn } from '@/lib/cn';
import { SITE_URL } from '@/lib/site';
import { profile } from '@/content/cv';

export const viewport: Viewport = {
  themeColor: '#070810',
};

/** First sentence of shortBio — used as the meta description. */
const metaDescription = profile.shortBio.split('. ')[0] + '.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nick de Rozarieux — Lead Software Engineer',
    template: '%s · iamnick.dev',
  },
  description: metaDescription,
  alternates: { canonical: '/' },
  manifest: '/site.webmanifest',
  icons: {
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    icon: [
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: 'Nick de Rozarieux — Lead Software Engineer',
    description: metaDescription,
    url: SITE_URL,
    siteName: 'iamnick.dev',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nick de Rozarieux — Lead Software Engineer',
    description: metaDescription,
  },
  other: {
    'mask-icon': '/safari-pinned-tab.svg',
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="en"
      className={cn(
        montserratFont.variable,
        openSansFont.variable,
        ryeFont.variable,
        fellFont.variable,
        fellScFont.variable,
      )}
    >
      <body className="bg-background-primary font-functional text-text-primary">
        <JsonLd />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
