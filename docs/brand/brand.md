# The iamnick brand — Blueprint

> Stage B output (ADR-0011). Direction ruled by Nick 2026-07-17 from three concept boards (`docs/brand/boards/`). This doc plus the token block below is the brand's source of truth; the Blueprint board's HTML (`concept-c-blueprint.html`) is the visual reference. Applies to every non-carnival surface — the blog first, then `StaticCv` and the carny's counter in a follow-on sweep. Never applied to carnival surfaces.

## Strategy

Front-end craft as engineering drawing: decisions dimensioned, work drawn to scale. The register is measured, precise and quiet — a senior engineer who shows the working (the AI-build-journal is the brand's substance, not just its content). Credible to hiring managers at a glance, satisfying to dev peers up close.

**Essence line:** Measured twice.

**Avoid:** anything carnival (neon, letterpress fairground, blue-black `#070810`), generic AI purple-glow, startup gradients, decorative noise. The red `#c50201` is **not** carnival-only: it is a core brand colour shared across the whole site (Nick's ruling, 2026-07-17) — on Blueprint surfaces it is the **redline**, the markup colour engineers draw corrections in. The wordmark, the dimension underline and text accents all carry it; steel blue is demoted to construction furniture.

## Identity

- **Mark:** a lowercase `n` built from visible construction geometry — grid, stems, quarter-turn arch — with its markup (points/tick) in the redline red. The construction lines are part of the identity (the brand literally shows its working). One refinement pass is owed: increase distinctiveness at small sizes (variants on `monogram-pass.png`, Nick's ruling pending).
- **Wordmark:** the iamnick.dev wordmark is used **verbatim everywhere** — Montserrat, `iamnick` in primary text with `.dev` in the red. Consistency of the mark beats token purity (Nick's ruling, 2026-07-17; supersedes the earlier `iam`-dimmed/steel-dot treatment). The same red is the brand's core accent site-wide — see Colour.
- **Detail language:** hairline grids, dimension labels (`fig. 07`, `r=26`), spec-sheet tables, measured rules, and the **redline underline** — a low-alpha red underline-highlight on at most one key phrase per view (ported from the Notebook board at Nick's request; recoloured steel → red when red became the core accent). Sparse — details reward looking closer.

## Colour

| Token                | Value                   | Role                                                                                                                                                  |
| -------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--brand-slate`      | `#14171c`               | base surface                                                                                                                                          |
| `--brand-panel`      | `#1a1e24`               | raised surface                                                                                                                                        |
| `--brand-white`      | `#edf0f3`               | primary text                                                                                                                                          |
| `--brand-fog`        | `#9aa3ad`               | secondary text                                                                                                                                        |
| `--brand-red`        | `#c50201`               | **the core accent** — the redline markup, shared with the carnival wordmark. Fills only (underline, rules); too dark for small text on slate (~2.9:1) |
| `--brand-red-bright` | `#f0463c`               | the redline for small text on slate (fig. labels, links, hovers) — ≥4.5:1                                                                             |
| `--brand-steel`      | `#7fa8d9`               | construction blue — grid and drawing furniture only, never text emphasis                                                                              |
| `--brand-hairline`   | `#262c34`               | rules, borders                                                                                                                                        |
| `--brand-grid`       | `rgba(127,168,217,.07)` | blueprint grid texture                                                                                                                                |

The system reads as a blueprint that has been **redlined**: steel-blue construction paper underneath, red markup on top. Red carries emphasis (the underline, fig. labels, links, one highlight per view); it never floods a surface. Body text targets AAA contrast.

## Type and space

- **Faces:** IBM Plex Sans (display + prose), IBM Plex Mono (meta: dates, tags, reading time, spec labels). Tabular figures where numbers align.
- **Scale:** Utopia fluid type and space (ADR-0009), brand-prefixed custom properties in the Tailwind v4 `@theme` block. Exact min/max viewports and steps are tuned in blog Stage 2 on real long-form content; working start point: body fluid 18→21px, measure 68ch max, paired space scale s-2…s+4.
- **Namespacing:** every brand token carries the `--brand-` prefix. Carnival components never reference brand tokens and vice versa (ADR-0009 consequence; review convention, ESLint rule candidate at the rebrand sweep).

## Voice

Plain, precise, first person. States measurements and reasons, not adjectives. Shows dead ends as data, not confessions. No exclamation marks, no hype vocabulary. British English, matching the docs house style.

## Considered directions (kept for the record)

- **A — whoami** (dark dev-native, terminal register, signal cyan): strong journal fit; monogram read ambiguously; the terminal framing risked costume over identity.
- **B — Notebook** (light editorial, ivory/ultramarine, `in.` monogram): the strongest single logo and hardest carnival separation; the light surface was the bigger leap from the site's existing register.
- Boards for all three remain in `docs/brand/boards/` as journal material.

## Open refinements

1. Monogram distinctiveness pass (small-size legibility, favicon/app-icon test) — before blog Stage 2 ships.
2. Utopia scale parameters finalised on the Stage 2 reading template.
3. Global nav treatment (currently carnival, per ADR-0011) — revisit after the blog ships.
4. Whether the carny persona copy survives inside a brand-styled counter — decided at the rebrand sweep.
