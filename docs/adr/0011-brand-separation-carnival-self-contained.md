# 0011 — Brand separation: the Dark Carnival is self-contained; the iamnick brand covers everything else

Status: accepted (2026-07-16)

The Dark Carnival is a self-contained creative entity — the immersive experience at `/` and its overlays and HUDs. It is not the site's brand. Everything outside it carries a new **iamnick brand**, to be defined in a dedicated brand-discovery session before blog Stage 2. Brand map at acceptance: the blog and all future routed content pages, `StaticCv` (the crawlable CV document), and the carny's counter (`/admin`). The global nav / site shell stays carnival-styled for now (revisitable during brand discovery). The blog uses no carnival vocabulary and no carnival styling.

## Why

Every earlier plan treated the carnival theme as the site's identity by default — the blog was specced first as "neon-styled", then as "dark shell + letterpress accents". Nick's correction (2026-07-16): the carnival is an exhibit, not the brand. A portfolio needs an identity that reads on its own on a reading surface, a CV document, or a search result — places where fairground styling is noise. Separating the two lets the carnival stay maximally itself while the rest of the site says "iamnick".

## Considered options

- **Carnival as site brand** — rejected: the original assumption. Ties every surface to a register designed for immersion, not reading; every new surface inherits a costume instead of an identity.
- **Per-surface ad hoc styling** — rejected: no identity at all; the current de facto state this ADR ends.
- **iamnick brand everywhere including the nav** — deferred, not rejected: the nav spans both worlds; Nick kept it carnival-styled for now. Brand discovery may revisit.

## Consequences

- New workstream, sequenced **before** blog Stage 2: brand discovery — palette, fluid type/space via Utopia (ADR-0009), voice, wordmark treatment (the existing iamnick.dev wordmark stays original) — producing brand tokens in `@theme` and a brand doc under `docs/brand/`. Concept boards are generated with the brandkit skill; **Nick owns every creative ruling**.
- The blog's reading identity is whatever brand discovery defines; the "dark shell + letterpress accents" ruling is superseded.
- The article surface needs no carnival-register glossary name; blog terms (Post, Tag, Draft) enter the glossary as plain English.
- `StaticCv` and the carny's counter adopt the brand in a follow-on sweep, separate from the blog build. Whether the carny _persona copy_ survives inside an iamnick-branded admin is a brand-voice question deferred to that sweep.
- Carnival glossary terms remain canon on carnival surfaces; nothing there changes.
- ADR-0009 is rescoped from site-wide to brand-only; the build workflow loses its live-surface migration stage.
