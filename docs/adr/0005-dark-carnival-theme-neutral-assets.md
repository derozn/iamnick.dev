# 0005 — Dark Carnival theme, built from neutral carnival assets only

The site's world is the **Dark Carnival** — a neon funfair at night (see `CONTEXT.md`). Environment props are sourced from the **Synty "POLYGON Horror Carnival"** pack: the **funfair assets** (tents, booths, ferris wheel, merry-go-round, ring/can-toss stalls, ticket booths, string lights, lamp posts, fences, food carts) plus, per the revision below, a few **static figures** for atmosphere. The mood is achieved mostly through lighting (neon glow, fog, warm stall pools), so the result reads as **atmospheric and a touch eerie — never gory**.

The scene is a **linear first-person midway street** the visitor walks down on-rails (ADR-0004), the structures lining both sides and the ferris wheel closing the avenue (see `docs/redesign/scene-layout.md`).

## Revision (2026-06 — art-direction call by Nick)

The original decision banned **all** characters and any horror cue, targeting a _cool, empty, abandoned_ funfair. After seeing the build, Nick chose a richer register: **"atmospheric, figures but no gore."** So:

- **Figures are now ALLOWED** — static animatronics / silhouette-read figures (carny, visitors, animatronic) standing among the stalls, for life and a little unease. They must read as posed, not broken (the source rigs export in T-pose — they need posing before use, so they are added deliberately, not dropped in raw).
- **Still hard-excluded:** blood, gore, mutilation, severed parts, viscera, jump-scare props, and grime/filth. The register is _moody and slightly uncanny_, **not** a horror/gore scene.
- Reviewers reject gore; they no longer reject the mere presence of figures.

## Considered options

- **Clean amusement-park pack (ITHappy, ~€82)** — rejected: clean packs skew bright/cheerful and fight the moody register, and Synty has no non-horror fairground pack. The Horror pack's atmosphere actually _suits_ the brief; its horror props simply go unused.
- **Enchanted Forest theme** — beautiful and tasteful with a native tree metaphor, but rejected as too calm / low-energy ("boring") for a goal of _wow + creativeness_; and bioluminescent-forest is a well-worn 3D subject.
- **Western/Frontier theme** — most unexpected, but loses the neon glow, carries kitsch risk, and is the largest rebuild.

## Why this is recorded

A future contributor will see "Horror Carnival" as the asset source and may be tempted to use the gore props, or worry figures are off-limits. The register is **atmospheric and a touch eerie, never gory** — figures are fine, viscera is not.

## Consequences

- Reviewers reject any **gory/grime** prop (blood, gore, severed parts, filth) entering the scene; tasteful figures are allowed (see Revision).
- Neon/bloom from the current build is **kept** (carnival is the only shortlisted theme that retains it natively).
- Confirm the Synty licence permits WebGL/web embedding; never expose raw pack meshes for download (serve compressed GLB in-canvas). Assets ship as FBX → require an FBX→GLB conversion + compression step (this build: `assimp` + `@gltf-transform`, Draco + WebP — see `docs/redesign/scene-layout.md` / the rebuild memory).
