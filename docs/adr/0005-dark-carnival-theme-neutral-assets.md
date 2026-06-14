# 0005 — Dark Carnival theme, built from neutral carnival assets only

The site's world is the **Dark Carnival** — a stylish-abandoned neon funfair at night (see `CONTEXT.md`). Environment props are sourced from the **Synty "POLYGON Horror Carnival"** pack used purely as a neutral asset library: only the **neutral funfair assets** (tents, booths, ferris wheel, ring/can-toss stalls, ticket booths, string lights, fences) are used. **Every horror-specific prop — clowns, blood, gore, skulls, weapons — is hard-excluded.** The mood is achieved through lighting (neon glow, fog, flicker), so the result reads as _cool and atmospheric, never creepy or horror_. The career is told as a run of **role attractions** along the Midway (the earlier "career tree" metaphor is dropped).

## Considered options

- **Clean amusement-park pack (ITHappy, ~€82)** — rejected: clean packs skew bright/cheerful and fight the moody register, and Synty has no non-horror fairground pack. The Horror pack's atmosphere actually _suits_ the brief; its horror props simply go unused.
- **Enchanted Forest theme** — beautiful and tasteful with a native tree metaphor, but rejected as too calm / low-energy ("boring") for a goal of _wow + creativeness_; and bioluminescent-forest is a well-worn 3D subject.
- **Western/Frontier theme** — most unexpected, but loses the neon glow, carries kitsch risk, and is the largest rebuild.

## Why this is recorded

A future contributor will see "Horror Carnival" as the asset source and either worry the site is meant to be scary, or be tempted to use the horror props. **Neither is correct** — the output must read as a cool abandoned funfair with zero horror content.

## Consequences

- Reviewers reject any horror prop entering the scene.
- Neon/bloom from the current build is **kept** (carnival is the only shortlisted theme that retains it natively).
- Confirm the Synty licence permits WebGL/web embedding; never expose raw pack meshes for download (serve compressed GLB in-canvas). Assets ship as FBX → require an FBX→GLB conversion + compression step.
