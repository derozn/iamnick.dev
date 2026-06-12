import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { PropsWithChildren } from 'react';

import { montserratFont, openSansFont } from '@/components/ui-modules/next/fonts/local';
import { JsonLd } from '@/components/organisms/JsonLd';
import { cn } from '@/lib/cn';
import { profile } from '@/content/cv';

export const viewport: Viewport = {
  themeColor: '#070810',
};

/** First sentence of shortBio — used as the meta description. */
const metaDescription = profile.shortBio.split('. ')[0] + '.';

export const metadata: Metadata = {
  metadataBase: new URL('https://iamnick.dev'),
  title: {
    default: 'Nick de Rozarieux — Lead Software Engineer',
    template: '%s · iamnick.dev',
  },
  description: metaDescription,
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
    url: 'https://iamnick.dev',
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

export const dynamic = 'auto';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={cn(montserratFont.variable, openSansFont.variable)}>
      <head />
      <body className="bg-background-primary font-functional text-text-primary">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
