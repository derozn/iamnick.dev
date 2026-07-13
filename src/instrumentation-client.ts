import * as Sentry from '@sentry/nextjs';

// Client-side, gated on the build-time NEXT_PUBLIC_SENTRY_DSN — no bytes shipped
// until it's set in Vercel.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
