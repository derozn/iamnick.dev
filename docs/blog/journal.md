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

**2026-07-17 — Stage 1, content pipeline.** The stage was mechanical exactly as designed — the
specs had absorbed all the thinking, so the build was transcription: velite, the Zod frontmatter
contract, `publishedPosts` as the single public read, tests beside it, gate green on the first
full run (162 tests). Both surprises were toolchain seams, not design. First, pnpm 11's
build-scripts gate nobody had tripped yet: a placeholder line under `allowBuilds` in
`pnpm-workspace.yaml` blocked esbuild — velite's transitive dep — and broke `pnpm exec` outright
until set to a real value. Second, the discovery that repo-wide prettier and lint-staged disagree
about HTML: the Stage B brand boards slipped through unformatted and turned master red on the
PR #72 merge — found within the hour and fixed in the next PR. One quiet win: the two seed Posts
mean every later stage tests against real content, not fixtures.
