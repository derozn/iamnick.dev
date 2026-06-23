# 0003 — Content-first DOM; the 3D scene is a decorative enhancement layer

All meaningful content — name, title, each role with dates and highlights, side projects, contact details — is **server-rendered semantic HTML**, driven from typed data (`src/content`). The 3D Dark Carnival renders behind and around that DOM as a visual enhancement and **must never be the sole source of any text or content**. Neon labels inside the scene (e.g. company names on Career Tree branches) are `aria-hidden` decorative duplicates of real DOM headings.

## Why

The site is a job-search portfolio. It must be fully indexable by search engines, scrapable for social link previews, navigable by screen readers, and it must degrade to a complete, styled, readable page when WebGL is unavailable or `prefers-reduced-motion` is set. Canvas pixels are invisible to all of those audiences.

## Consequences

- A reduced-motion / no-WebGL fallback that renders the full content **without** the canvas is a hard requirement, not a nice-to-have.
- 3D scene components read from the **same typed content** the DOM uses; content is never authored directly into the scene.
- Reviewers should reject any change that introduces canvas-only content.
