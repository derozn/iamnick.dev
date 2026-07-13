import type { NextConfig } from 'next';

// varlock is adopted schema-first (refactor Phase 3): .env.schema declares the
// env surface and `pnpm env:check` validates it (redacted output). The runtime
// integration (@next/env override + plugin) is DEFERRED: its @next/env swap
// needs pnpm overrides, which pnpm 11 only reads from pnpm-workspace.yaml —
// gitignored here for Vercel. Flip once a preview deploy proves a committed
// workspace file is safe (docs/refactor-plan.md Phase 3).

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

export default nextConfig;
