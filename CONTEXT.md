# iamnick.dev

Nick de Rozarieux's portfolio site — a single, scroll-driven 3D experience. This glossary fixes the shared language for the v2 "Dark Carnival" redesign so any agent or session uses the same words for the same things.

## Language

**Midway**:
The single scrollable path the camera travels through the Dark Carnival, lined with attractions in order: header → Career Highlights → ball-toss → side projects → contact → doodle wall. The spine of the whole experience. Navigated on-rails (scroll-driven camera), not free-roam.
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
Opting into an interactive stall (a game). By default the visitor travels past a stall as scenery; tapping its Play affordance "steps in" — scroll locks and input switches to driving the game until they exit. The opposite of travelling.
_Avoid_: enter game, open game, launch

**Full** (experience profile):
The complete Dark Carnival for capable pointer devices (desktop): full-fidelity 3D plus every interactive stall, including the ball-toss game.
_Avoid_: desktop mode

**Lite** (experience profile):
The deliberately lighter Dark Carnival for phones/touch: the same continuous 3D scene at reduced fidelity, with the ball-toss game shown as non-playable scenery. The doodle wall and blog remain fully usable (view + draw) on Lite.
_Avoid_: mobile mode, reduced mode

**Ball-toss**:
The fairground game where you throw a ball at stacked tins. Playable only on Full; appears as lit scenery on Lite.
_Avoid_: tin game, coconut shy, throwing game

**Doodle wall**:
The communal stall where any visitor draws and everyone sees what past visitors drew. A grid of tiles showing the most recent approved contributions (bounded, older tiles age out); persisted, not live. Full-feature on both Full and Lite (view + draw).
_Avoid_: graffiti wall, shared canvas, drawing board

**Tile**:
One visitor's single contribution to the doodle wall — their own framed drawing space. Submitted to a pre-moderation queue; only appears on the wall once Nick approves it.
_Avoid_: cell, square, slot, post

**Pre-moderation queue**:
The holding area every submitted tile enters. Nick reviews and approves/rejects each one; unapproved tiles are never shown publicly.
_Avoid_: review board, moderation inbox
