import * as Sentry from '@sentry/nextjs';

// Gated on SENTRY_DSN. Kept for completeness even though the fortune route runs
// on the Node runtime — any future edge code (e.g. middleware) is covered.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) delete event.request.data;
      return event;
    },
  });
}
