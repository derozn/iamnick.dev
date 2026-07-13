# iamnick.dev

[![CI](https://github.com/derozn/iamnick.dev/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/derozn/iamnick.dev/actions/workflows/ci.yml)

Nick de Rozarieux's portfolio — an isometric, drag-to-explore **Dark Carnival**
built with Next.js and React Three Fiber. The visitor pans and zooms a
neon-lit fairground at night; clicking an attraction's indicator flies the
camera in and opens that CV section as a letterpress overlay. Two stalls are
playable games (ball-toss, high-striker), a golden-ticket hunt threads the
grounds, and Madame Zara's fortune wagon answers questions about Nick via
`/api/fortune` (Anthropic-backed, grounded in the CV). The full CV is also
present as always-rendered DOM — screen-reader- and crawler-visible, and the
visible page under `prefers-reduced-motion`.

## Stack

| Layer           | Technology                                                                  |
| --------------- | --------------------------------------------------------------------------- |
| Framework       | Next.js (App Router)                                                        |
| UI              | React + TypeScript + Tailwind CSS v4                                        |
| 3D              | Three.js via React Three Fiber (`@react-three/fiber`, Drei, postprocessing) |
| State           | zustand                                                                     |
| Fortune API     | `@anthropic-ai/sdk` (edge route, streaming)                                 |
| Testing         | Vitest + Testing Library                                                    |
| Package manager | pnpm                                                                        |

## Getting started

```bash
pnpm install
pnpm dev          # dev server at http://localhost:3000
```

Copy `.env.example` to `.env.local` if you want Madame Zara live:
`ANTHROPIC_API_KEY` is optional — without it (or with `FORTUNE_STUB=1`) the
fortune route streams a canned in-character reading, so nothing else needs
credentials.

## Verification

```bash
pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build
```

CI runs the same gate on every push and PR. Scene changes are additionally
verified with headless screenshots — see `docs/redesign/STATUS.md`.

## Where to read next

- **`CONTEXT.md`** — the domain glossary. Canonical language (Midway,
  Attraction, Stall, Overlay, HUD, CV, Full/Lite…); use its words.
- **`docs/redesign/STATUS.md`** — start-here doc for a working session: scene
  architecture, verification workflow, current state.
- **`docs/CODE_QUALITY_AUDIT.md`** — July 2026 audit of the codebase.
- **`docs/refactor-plan.md`** — the standards refactor (7 phases) currently
  being executed.
- **`docs/adr/`** — locked decisions; supersede in writing, never silently.

## Deploy

Deploys to [Vercel](https://vercel.com) on push to `master`.
