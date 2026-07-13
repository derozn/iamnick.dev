# Deploying iamnick.dev

Target: **Vercel** (Next.js App Router, pnpm). The site is deployable with **zero
environment variables** — everything degrades gracefully — then features light up
as you add credentials.

## Deploy with nothing configured

`git push` / import the repo into Vercel. It builds and serves the full site:

- The 3D Dark Carnival, all overlays, games, and the crawlable CV.
- **Madame Zara runs in stub mode** — canned in-character Readings, no model
  calls, no tokens spent.
- Rate limiting is active (in-memory, per instance).
- Sentry and Vercel Analytics are inert.

### pnpm build approvals (two mechanisms, one per pnpm version)

Native deps `sharp` and `@sentry/cli` run install scripts that pnpm must approve.
Vercel installs with **pnpm 9** (chosen by project-creation date, ignoring the
`packageManager` field), which reads approvals from **`package.json` →
`pnpm.onlyBuiltDependencies`** and rejects a packages-less `pnpm-workspace.yaml`.
Local + CI use **pnpm 11** (via `packageManager`), which reads **`allowBuilds`**
from a `pnpm-workspace.yaml` (gitignored; CI writes it) and ignores the
package.json key with a harmless warning. Both are kept in sync.

> **Recommended cleanup:** enable Corepack on Vercel (set
> `ENABLE_EXPERIMENTAL_COREPACK=1` in the project's env) so Vercel also uses
> pnpm 11. Then a single committed `pnpm-workspace.yaml` (allowBuilds) covers
> everything, the package.json key + the pnpm-11 warning go away.

### CI

The `E2E (Playwright)` job runs only the reliable `@ci`-tagged subset (API
contract, a boot smoke, the no-canvas reduced-motion path) — the full scene
suite is flaky under headless SwiftShader and is run locally with
`pnpm test:e2e`.

## Environment variables (all optional)

Set these in **Vercel → Project → Settings → Environment Variables**. See
`.env.schema` for the canonical list (`pnpm env:check` validates locally).

| Variable                 | Enables                               | Notes                                                                  |
| ------------------------ | ------------------------------------- | ---------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`      | Real Madame Zara (live Claude Haiku)  | Absent or invalid → stub/canned Readings. Server-only.                 |
| `FORTUNE_STUB=1`         | Forces stub mode even with a key      | For preview environments.                                              |
| `SENTRY_DSN`             | Server + edge error reporting         | Read at runtime; init is gated on it.                                  |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser error reporting               | **Read at BUILD time** — set it before the deploy build to bake it in. |
| `REDIS_URL`              | (Future) cross-instance rate limiting | Not wired yet — the limiter is in-memory; see `rateLimit.ts`.          |

Vercel Analytics activates automatically on Vercel (the `<Analytics />` component
is already mounted); no variable needed.

## After the first deploy

- **Madame Zara:** add `ANTHROPIC_API_KEY`, redeploy, then run the manual smoke —
  ask one question, and force one mid-stream close — on the preview URL.
- **Sentry:** add both DSNs (+ `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN`
  if you want source-map upload), redeploy.
- **Renovate:** install the GitHub app; `renovate.json` is already committed.

## CI

`.github/workflows/ci.yml` gates every PR: env-schema check, lint, typecheck,
unit/component tests, knip, build, and a Playwright e2e job (runs against a
production build with `FORTUNE_STUB=1`). Local equivalent: `pnpm validate`
(+ `pnpm test:e2e`).
