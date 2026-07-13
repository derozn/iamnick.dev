import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import { varlockNextConfigPlugin } from '@varlock/nextjs-integration/plugin';

// varlock owns env loading: the `next>@next/env` override (pnpm-workspace.yaml)
// swaps Next's internal loader for varlock's, and this plugin wires it in. So
// .env.schema is the source of truth — validated at build, secrets redacted
// from logs, and env leaks caught at build + runtime. (Needed Corepack so
// Vercel reads the pnpm override; see docs/DEPLOY.md.)
const withVarlock = varlockNextConfigPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

// Wrap with Sentry only when a DSN is present at build (Vercel, once configured);
// without it the build is untouched. varlock wraps the result either way.
const withSentry = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      // Source-map upload needs SENTRY_ORG/PROJECT/AUTH_TOKEN; skipped until set.
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : nextConfig;

export default withVarlock(withSentry);
