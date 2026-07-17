# Blog build journal

Raw material for the AI-build-journal posts — one dated paragraph per stage, appended at each
Absorb: what was decided, what surprised us, what the human gate changed.

**2026-07-16 — Stage 0, spec and course correction.** Discovery interviews locked the scope in one
sitting: MDX in the repo, a Velite typed content layer (ADR-0008), Utopia fluid type (ADR-0009), and
a deliberately designed delivery workflow with a two-component hard cap (ADR-0010). Then the day's
real lesson: within an hour of the ADRs being accepted, Nick corrected course — the Dark Carnival is
a self-contained entity, an exhibit, not the site's brand (ADR-0011). That single ruling killed the
"dark shell + letterpress accents" reading identity and deleted the riskiest planned stage outright,
the Utopia migration of live HUD surfaces. The surprise is worth keeping: an accepted ADR lasted
under an hour, because the specs had inherited the carnival theme by default — nobody had ever asked
the brand-boundary question. The human gate did exactly what it exists for.

**2026-07-17 — Stage B, brand discovery.** The iamnick brand was chosen from three concept boards —
whoami (terminal-register dark), Notebook (light editorial), Blueprint (engineering-drawing slate and
steel) — and Nick ruled **Blueprint**: decisions dimensioned, work drawn to scale, one steel-blue
accent, IBM Plex. `docs/brand/brand.md` is now the source of truth. The surprise: with no image tool
available, the boards were built as real rendered HTML screenshotted through Playwright — and that
constraint turned out better than the intended mockups, because the winning board's CSS is now the
literal token source rather than a picture to be reverse-engineered. Owed before Stage 2 ships: a
monogram distinctiveness pass at small sizes.
