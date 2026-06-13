# iamnick.dev

[![CI](https://github.com/derozn/iamnick.dev/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/derozn/iamnick.dev/actions/workflows/ci.yml)

Nick de Rozarieux's personal portfolio — a scroll-driven 3D journey built with Next.js and React Three Fiber. The site renders an interactive cyberpunk cityscape that the camera flies through as you scroll, with each island representing a chapter of Nick's career.

## Stack

| Layer                | Technology                                                                     |
| -------------------- | ------------------------------------------------------------------------------ |
| Framework            | Next.js (App Router)                                                           |
| UI                   | React + TypeScript + Tailwind CSS                                              |
| 3D                   | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| Post-processing      | `@react-three/postprocessing`                                                  |
| Animation            | Motion (Framer Motion)                                                         |
| State                | Zustand                                                                        |
| Linting / Formatting | ESLint + Prettier                                                              |
| Testing              | Vitest + Testing Library                                                       |
| Package manager      | pnpm 11                                                                        |

## Quickstart

```bash
pnpm install      # install dependencies
pnpm dev          # start dev server at http://localhost:3000
pnpm build        # production build
pnpm test:ci      # run tests once (CI mode)
```

## Architecture

```
src/
  app/                        # Next.js App Router pages & metadata
  components/
    atoms/                    # Primitive UI components (buttons, typography…)
    organisms/                # Composed feature sections (JsonLd, nav…)
    three/                    # All Three.js / R3F scene components
      islands/                # Scene islands (Hero, Work, About…)
      journey.config.ts       # Camera path & scroll-position tuning knobs
  content/
    cv.ts                     # Single source of truth for profile / CV data
  modules/
    Interactive/              # Standalone interactive experiments
  styles/                     # Global CSS + Tailwind config
```

### Key config files

- **`src/content/cv.ts`** — edit this to update bio, roles, skills, and projects shown in the journey.
- **`src/components/three/journey.config.ts`** — tweak camera waypoints, scroll weights, and island positions without touching scene code.

## Deploy

The site deploys automatically to [Vercel](https://vercel.com) on every push to `master`. No manual steps required.
