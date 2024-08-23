import '@/styles/global.css';
import '@iamnick/config/tailwind-base.css';
import '@iamnick/ui/src/styles/global.css';

import classnames from 'classnames';
import type { Metadata, Viewport } from 'next';
import { PropsWithChildren, Suspense } from 'react';

import { montserratFont, openSansFont } from '@iamnick/ui/src/modules/next/fonts/local';
import { ThemeProvider } from '@iamnick/ui/src/modules/theme/components';
import { PageLoader } from '@iamnick/ui/src/components/atoms/Loader/PageLoader';
import { uiPortalId } from '@iamnick/ui/src/utils/portal';

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: 'iamnick.dev | Full stack developer',
  description: 'A Creative Full Stack Developers personal portfolio',
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
    title: 'iamnick.dev | Full stack developer',
    description: 'A Creative Full Stack Developers personal portfolio',
    url: 'https://iamnick.dev',
    siteName: 'iamnick.dev',
    images: [
      {
        url: 'https://iamnick.dev/social-icon-260.jpg',
        width: 260,
        height: 260,
      },
    ],
    locale: 'en-GB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'iamnick.dev | Full stack developer',
    description: 'A Creative Full Stack Developers personal portfolio',
    creator: '@pk_marval',
    images: [
      {
        url: 'https://iamnick.dev/social-icon-260.jpg',
        width: 260,
        height: 260,
      },
    ],
  },
  other: {
    'mask-icon': '/safari-pinned-tab.svg',
  },
};

export const dynamic = 'auto';

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={classnames(montserratFont.variable, openSansFont.variable)}>
      <head />
      <body>
        <ThemeProvider>
          <main>
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </main>
        </ThemeProvider>
        <div id={uiPortalId} className="relative z-10" />
      </body>
    </html>
  );
}
