# Nick's voice

> The tone-of-voice reference for **all visitor-facing writing** — Post prose, blog UI copy, descriptions, OG text. Anything public gets written against this file and final-passed through the avoid-ai-writing skill (with this profile) before merge. Enforcement points: `/publish-post` voice pass, and the copy check in every build-stage gate.
>
> v0.1 — calibrated 2026-07-17 from Nick's own messages plus interview answers. Refined after Nick line-edits the first rewritten Post (that edit IS the calibration; update this file from what survives).

## The register

Write like Nick talks, tidied just enough to read. The CV stays formal; the blog does not. Chat spellings get corrected ("u" → "you"), the rhythm does not.

Evidence this is built from (verbatim Nick):

- "I've made a big error. The blog does not have to conform to the carnival theme."
- "also its not a 'Build journal' it can be anything I want. basically 'nicks rambles'"
- "the red should carry through on the blog. It's a core brand colour. Maybe instead of that blue accent?"
- "I guess it's related to the monogram stuff?"
- "whats next"

## Rules (do)

1. **Front-load the point.** Say the thing in the first sentence, clarify after. No wind-ups, no scene-setting intros.
2. **Short declaratives.** One idea per sentence. Fragments are fine. Starting with "And", "But", "Also", "Basically" is fine.
3. **First person singular, always.** It's Nick's site and Nick's decisions. "I", even when an AI pair did the typing — **never "we" for solo work** (hard ban).
4. **Contractions everywhere.** "It's", "doesn't", "I'd". Uncontracted forms read like a solicitor's letter.
5. **Name things plainly.** "the underscore thing", "the monogram stuff" — call things what they are, not what a design system would call them. Concrete nouns, real numbers, actual file names.
6. **Questions as proposals.** Floating an idea reads as a question: "Maybe red instead of the blue?" — that's how Nick suggests, keep it.
7. **Own the mistakes flatly.** "I've made a big error" — state it, fix it, move on. Dead ends are content, not confessions. No drama either way.
8. **Dry, self-deprecating edge.** Understated British dryness, laughing at his own dead ends, never at the reader. If a joke needs a signpost, cut it.
9. **British English.** Colour, behaviour, whilst never "gotten".

## Hard bans (Nick's ruling, 2026-07-17)

- **"We" when Nick means "I"** — including for AI-pair work.
- **Emoji** — anywhere in prose.
- **Exclamation marks** — anywhere in prose.

## Strong avoids

- LinkedIn-speak: "thrilled", "leverage", "passionate about", "excited to share".
- Guru framing: "here's the thing", lessons-learned closers, inspirational sign-offs, calls to action.
- Hedge-fluff: "arguably", "it's worth noting", "in many ways".
- Formal connectives where a plain one exists: "furthermore" → "also"; "however" mid-sentence → "but" up front.
- AI tells — balanced "not just X but Y" constructions, triads, tidy little summary paragraphs. The avoid-ai-writing pass exists to kill these; don't write them in the first place.
- CONTEXT.md `_Avoid_` terms apply to prose too (no "resume", no "journey", etc.).

## Calibration example

**Before** (AI-drafted seed, failed the reading-feel gate):

> This blog documents its own construction. Before any of these pages existed there was a spec set — a discovery document with a numbered decision log, product requirements, four architecture decision records and a designed delivery workflow — written with an AI pair and ruled on by me.

**After** (Nick's register):

> This blog had paperwork before it had pages. A discovery doc, a PRD, four ADRs, a delivery plan — I made the AI write all of it up front, then argued with most of it.

## How this file is used

1. Drafting: Nick drafts; if AI touches prose it edits toward this file, never away from it.
2. `/publish-post` voice pass: avoid-ai-writing runs edit-in-place with this profile.
3. UI copy in build stages: any visitor-facing string in a PR gets checked against this file at the stage gate.
4. This file only changes when Nick's edits show it's wrong — update it from his line-edits, not from taste.
