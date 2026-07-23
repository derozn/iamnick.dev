# Nick's voice

> Tone-of-voice reference for all visitor-facing writing. That covers Post prose, blog UI copy, descriptions, OG text. Anything public gets written against this file, then run through the avoid-ai-writing skill before it merges. Enforcement happens at the `/publish-post` voice pass and the copy check in every build-stage gate.
>
> v0.2, calibrated 2026-07-17 from Nick's own messages and interview answers, expanded 2026-07-23 with his writing-principle rulings. This file changes only when Nick's line-edits show it's wrong. Update it from what survives his edits, not from taste.

## Always run the skill

Every piece of public copy goes through the avoid-ai-writing skill before it ships. No exceptions. Write it clean by hand first, then run the skill as the safety net. The rules below say what "clean" means here.

## The register

Write like Nick talks, tidied just enough to read. The CV stays formal. The blog does not. Correct the chat spellings ("u" becomes "you"). Keep the rhythm.

Evidence this is built from (verbatim Nick):

- "I've made a big error. The blog does not have to conform to the carnival theme."
- "also its not a 'Build journal' it can be anything I want. basically 'nicks rambles'"
- "the red should carry through on the blog. It's a core brand colour. Maybe instead of that blue accent?"
- "I guess it's related to the monogram stuff?"
- "whats next"

## Rules (do)

1. **Front-load the point.** Say the thing in the first sentence, clarify after. No wind-ups, no scene-setting intros.
2. **Short declaratives.** One idea per sentence. Fragments are fine. Starting with "And", "But", "Also", "Basically" is fine.
3. **Say it straight.** Make the affirmative statement. Say what a thing is, not what it isn't or what it's supposedly more than. See the setup-then-swerve ban below.
4. **Simple words win.** Write so anyone reads it first time, whatever their background. If a word sends someone to Google, pick a plainer one. Plain beats clever every time.
5. **Vary the shape.** Mix sentence lengths and structures. If three sentences in a row share a skeleton, break one. Be inventive with how a point lands.
6. **First person singular, always.** It's Nick's site and Nick's decisions. "I", even when an AI pair did the typing. Never "we" for solo work.
7. **Contractions everywhere.** "It's", "doesn't", "I'd". Uncontracted forms read like a solicitor's letter.
8. **Name things plainly.** "the underscore thing", "the monogram stuff". Call things what they are, not what a design system would call them. Concrete nouns, real numbers, actual file names.
9. **Questions as proposals.** Floating an idea reads as a question. "Maybe red instead of the blue?" That's how Nick suggests. Keep it.
10. **Own the mistakes flatly.** "I've made a big error." State it, fix it, move on. Dead ends are content, not confessions.
11. **Dry, self-deprecating edge.** Understated British dryness, laughing at his own dead ends, never at the reader. If a joke needs a signpost, cut it.
12. **British English.** Colour, behaviour, whilst. Never "gotten".

## Hard bans

- **Dashes joining clauses.** No em dashes. No en dashes standing in for one. Break the sentence in two, or use a comma. Hyphens inside words like "self-deprecating" are fine.
- **Setup-then-swerve.** Kill "X isn't just about Y", "X is more than just Y", and "not X, but Y". They promise a reveal and then deflate it. State the point outright.
- **Repeating template structures.** Watch for the "label: thing, thing, thing" colon-list in prose, the rule-of-three, and any shape you already used a paragraph ago. Rewrite the repeat into something fresh.
- **"We" when Nick means "I".** Includes AI-pair work.
- **Emoji.** Anywhere in prose.
- **Exclamation marks.** Anywhere in prose.

## Strong avoids

- LinkedIn-speak such as "thrilled", "leverage", "passionate about", "excited to share".
- Guru framing such as "here's the thing", lessons-learned closers, inspirational sign-offs, calls to action.
- Hedge-fluff such as "arguably", "it's worth noting", "in many ways".
- Formal connectives where a plain one exists. "Furthermore" becomes "also". "However" mid-sentence becomes "but" up front.
- Tidy summary paragraphs that restate what you just said.
- CONTEXT.md _Avoid_ terms apply to prose too, so no "resume", no "journey", and the rest.

## Calibration example

**Before** (AI-drafted seed, failed the reading-feel gate):

> This blog documents its own construction. Before any of these pages existed there was a spec set — a discovery document with a numbered decision log, product requirements, four architecture decision records and a designed delivery workflow — written with an AI pair and ruled on by me.

**After** (Nick's register):

> This blog had paperwork before it had pages. A discovery doc, a PRD, four ADRs, a delivery plan. I made the AI write all of it up front, then argued with most of it.

## How this file is used

1. Drafting. Nick drafts. If AI touches prose it edits toward this file, never away from it.
2. `/publish-post` voice pass. avoid-ai-writing runs edit-in-place with this profile.
3. UI copy in build stages. Any visitor-facing string in a PR gets checked against this file at the stage gate.
4. This file only changes when Nick's edits show it's wrong. Update it from his line-edits, not from taste.
