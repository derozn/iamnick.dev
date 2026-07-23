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

**2026-07-17 — Stage 2, routes + reading template.** The brand went from board to shipped tokens
in a single stage because the board _was_ CSS — the Blueprint token block transferred into
`@theme` almost verbatim, and the Utopia scale that had been deferred "until the reading template
exists" was settled the moment the template did. Three surprises, all instructive. The
react-hooks linter objected to compiled-MDX's core pattern — a component constructed at render
time — and the right fix was a documented exception with its justification kept beside the
disable, not a workaround that fights the mechanism. knip caught a dependency installed out of
habit: the standalone `shiki` package, when `@shikijs/rehype` already carries its own. And Next
16 quietly dropped per-route size output, so the first-load JS baseline had to be measured by
hand from the prerendered HTML — which is exactly how we learned that blog pages inherit the
carnival's ~1 MB root-layout client bundle, paying for motion and zustand a page with no canvas
never uses. A deviation worth recording: a third seed Post, because prev/next cannot be tested
with one published Post. The stage ends at the human gates — Nick reads the feel on the PR
preview, and rules the monogram pass.

**2026-07-23 — Stage 4, SEO surfaces.** Every metadata, discovery and social surface went on in one
stage, and all of them read the same `publishedPosts` list and nothing else, so by construction a
Draft cannot leak into a feed, a sitemap or a social card. The per-Post card was the one real
design call. It had to be the Blueprint brand rather than the carnival poster, and Satori ships no
brand typeface, so the palette carries the identity on its own. Slate ground, a steel margin down
the left, a redline underline and the wordmark with its red `.dev` do the work the face would. Two
surprises, both from the platform. Next 16 now refuses the edge runtime on an image route that also
pre-renders per slug, so the card fell back to the Node default, which is the preferred default now
anyway. And the seed set had drifted while nobody was watching. The Stage 2 merge put two of the
three Posts back into Draft, leaving one published, which turned the prev/next test into a skip and
made that single Post the fixture the SEO contract tests pin to. The lesson worth keeping is that
content state is now part of the test surface, not just the pages. One quiet win to close on: RSS
was hand-rolled instead of pulled from a package, so knip stayed green and nothing new entered the
tree.
