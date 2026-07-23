# iamnick.dev

## Writing and voice

All visitor-facing copy (Post prose, blog UI strings, descriptions, OG text) follows `docs/brand/voice.md`. Read that file before you draft or edit any public copy, then run the avoid-ai-writing skill on the result before it merges. The `/publish-post` voice pass and the copy check in every build-stage gate enforce this.

`voice.md` sits on top of Nick's global writing rules (`~/.claude/rules/writing.md`), which ban em dashes, setup-then-swerve constructions, colon-list templates, and fancy words across everything. `voice.md` adds the iamnick persona on top: first-person "I" and never "we" for solo work, British English, dry and self-deprecating, no emoji, no exclamation marks.

## Conventions and naming

`CONTEXT.md` is the glossary and conventions law for this repo. Check it for canonical names (Post, Tag, Draft, the iamnick brand, carnival terms) and the `_Avoid_` list before naming anything new. The `_Avoid_` terms apply to prose too.
