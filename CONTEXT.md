# iamnick.dev

Nick de Rozarieux's portfolio site. This glossary fixes the shared language for the whole site — the v2 "Dark Carnival" experience and the iamnick-brand surfaces around it — so any agent or session uses the same words for the same things.

## Language

**Midway**:
The carnival street lined with attractions — header → Career Highlights → ball-toss → side projects → contact → doodle wall — that the visitor explores freely with an isometric drag/zoom camera; clicking an attraction's indicator flies the camera in (free-roam superseded on-rails, ADR-0007).
_Avoid_: journey, path, track, the scroll

**Attraction**:
Any stop along the Midway — the Career Tree, an exhibit, a game. The umbrella term for a section.
_Avoid_: island, section, stop

**Stall**:
An attraction you can step into and play — a game (ball-toss, doodle wall). A subset of attractions; the non-interactive ones (Career Tree, side projects, contact) are not stalls.
_Avoid_: booth, game zone

**Career Highlights**:
The work-history portion of the Midway, told as a run of neon-lit attractions — each role its own tent/stall the visitor travels past, earliest first and present-day last. (Replaces the earlier "career tree" idea, which was dropped with the theme lock.) Education / earliest roles open the run; the current role closes it. Side projects are a separate attraction further along, not part of this run.
_Avoid_: career tree, career islands, timeline, work history wall

**Dark Carnival**:
The world/setting the entire site takes place in — a neon-lit funfair at night: tents, lit stalls, string lights and bulbs, neon glow in the fog, a ferris wheel closing the street. The register is **atmospheric and a touch eerie — moody, "a carnival after dark" — but never gory** (ADR-0005, revised). A few **static figures** (animatronics, silhouettes) give it life and unease; there is no blood, gore or grime. The unifying metaphor that lets a career exhibit, a fairground game, and a communal doodle wall share one street. Keeps the neon-noir lighting; reframes the former "cyberpunk city" framing.
_Avoid_: cyberpunk city, neon city, funfair (too bright/cheerful), gore/blood/grime, jump-scares

**Step-in**:
Opting into an interactive stall (a game). By default a stall is scenery; tapping its Play affordance "steps in" — input switches to driving the game until the visitor exits back to exploring. The opposite of travelling.
_Avoid_: enter game, open game, launch

**Full** (experience profile):
The complete Dark Carnival for capable pointer devices (desktop): full-fidelity 3D plus every interactive stall, including the ball-toss game.
_Avoid_: desktop mode

**Lite** (experience profile):
The deliberately lighter Dark Carnival for phones/touch: the same continuous 3D scene at reduced fidelity, with the ball-toss game shown as non-playable scenery. The doodle wall and blog remain fully usable (view + draw) on Lite.
_Avoid_: mobile mode, reduced mode

**CV**:
Nick's professional history as structured data (`content/cv.ts`) — the single source of truth rendered as the crawlable/visible DOM document and grounding Madame Zara's readings.
_Avoid_: resume, work history, profile data

**Overlay**:
Any DOM UI layered over the canvas — content panels, the intro veil, HUDs. The carnival is canvas; everything readable floats above it as an overlay.
_Avoid_: modal (only some overlays are modal), popup, layer

**HUD**:
An in-game or status overlay — the ball-toss, high-striker and doodle wall game panels and the golden-ticket tally. A subset of overlays; the `Hud` suffix and `hud-*` styling are reserved for these.
_Avoid_: game UI, scoreboard, widget

**Ball-toss**:
The fairground game where you throw a ball at stacked tins. Playable only on Full; appears as lit scenery on Lite.
_Avoid_: tin game, coconut shy, throwing game

**Madame Zara**:
The fortune teller — the character in the painted wagon who answers visitor questions about Nick, grounded solely in the CV. Her wagon is an attraction, not a stall — conversation happens in an overlay, no step-in.
_Avoid_: chatbot, AI assistant, fortune bot

**Reading**:
One reply from Madame Zara — a drawn Card named as the heading, then a short in-character body.
_Avoid_: response, completion, answer

**Card**:
One of the fixed twelve-card deck; every Reading opens by naming the drawn Card.
_Avoid_: tarot card, prompt template

**Doodle wall**:
The communal stall where any visitor draws and everyone sees what past visitors drew. A grid of tiles showing the most recent approved contributions (bounded, older tiles age out); persisted, not live. Full-feature on both Full and Lite (view + draw).
_Avoid_: graffiti wall, shared canvas, drawing board

**Tile**:
One visitor's single contribution to the doodle wall — their own framed drawing space. Submitted to a pre-moderation queue; only appears on the wall once Nick approves it.
_Avoid_: cell, square, slot, post

**Pre-moderation queue**:
The holding area every submitted tile enters. Nick reviews and approves/rejects each one; unapproved tiles are never shown publicly.
_Avoid_: review board, moderation inbox

**The carny**:
The stallholder persona of the doodle wall's pre-moderation queue. Visitors meet him in copy ("your tile is with the carny"); Nick _is_ the carny at the carny's counter — the allow-listed /admin account acts in his name. Internal identifiers (`MODERATOR_EMAILS`, `kind: 'moderator'`) stay technical.
_Avoid_: moderator (in visitor-facing copy), attendant, admin (as a character)

**The carny's counter**:
/admin — where the carny works. A plain DOM page (no canvas): not an attraction, not a stall, not an overlay. Two views: **the queue** (/admin — pre-moderation verdicts) and **the wall** (/admin/wall — housekeeping: taking down hung tiles, a final reject). "Counter" is deliberate — "booth" stays banned (see Stall).
_Avoid_: booth, admin panel/dashboard (in copy), back office

**Verdict**:
The carny's single ruling on a queued tile: approve (publishes to the wall) or reject (final — a rejected tile is never restored; an approved tile can later be rejected to take it down). Code carries it as `Verdict`; the moderation route's body field is `verdict`.
_Avoid_: decision, action (in copy), ban/delete

**iamnick brand**:
The identity of every non-carnival surface (ADR-0011): the blog and future content pages now, `StaticCv` and the carny's counter after their rebrand sweep. Source of truth is `docs/brand/brand.md`; tokens carry the `--brand-` prefix and never mix with carnival tokens. The Dark Carnival is a self-contained entity inside the site, not its brand.
_Avoid_: site theme, blog theme, Blueprint (as the brand's name — Blueprint names the ruled direction/board)

**Blog**:
The site's long-form writing surface — `/blog` and `/blog/[slug]`, statically generated from MDX, the primary indexable-text/SEO surface. An **iamnick-brand** surface, not a carnival one (ADR-0011): no carnival styling or vocabulary, no live canvas, three.js never in its bundles. Flagship content is the AI-build-journal.
_Avoid_: news, writings, articles (as the section name)

**Post**:
A single blog entry — an MDX file in `content/blog/` with schema-validated frontmatter (ADR-0008), rendered at `/blog/[slug]` with per-post SEO. Distinct from a doodle-wall Tile.
_Avoid_: article, story

**Tag**:
A Post's topic label from frontmatter, browsable at `/blog/tags/[tag]`. The vocabulary is kept deliberately small; the publish pipeline warns on new tags.
_Avoid_: category, label, topic (as the mechanism name)

**Draft**:
A Post with `draft: true` — previewable in development, excluded from production routes, index, tag pages, sitemap and RSS through the single `publishedPosts` accessor. Publishing a Draft is flipping the flag and merging the PR.
_Avoid_: unpublished post, pending post
