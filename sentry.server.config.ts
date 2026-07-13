import * as Sentry from '@sentry/nextjs';

// Gated on SENTRY_DSN: absent (dev, or before the DSN is set in Vercel) → a
// complete no-op. Visitor questions to Madame Zara are user content, so request
// bodies are never shipped.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1, // low — portfolio traffic
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) delete event.request.data;
      return event;
    },
  });
}
