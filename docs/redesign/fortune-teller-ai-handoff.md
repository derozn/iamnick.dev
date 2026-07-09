# Fortune Teller — LLM attraction (handoff)

> **Status: approved, not started.** Nick chose this as the site's LLM
> integration (decided July 2026). This doc is written so a fresh session can
> build it without prior context. Read `CONTEXT.md` (glossary) and
> `docs/CODE_QUALITY_AUDIT.md` § "Conventions for the next agent" FIRST — the
> conventions there (static-bundle boundary, immutability lint rules, GPU
> contract, verification recipe) are non-negotiable and this doc assumes them.

## What we're building

**"Madame Zara" — a fortune-teller booth in the carnival that answers questions
about Nick.** Visitors click the fortune-teller wagon, the camera flies in
(existing POI machinery), and a letterpress chat panel rises where an
in-character fortune teller answers questions grounded in Nick's CV —
"has Nick led teams?", "what did he do at Gousto?" — deflecting everything
off-topic in character ("the cards are silent on such matters…").

Why this and not a chat widget: it's on-theme (the feature IS the site's
personality), genuinely useful to recruiters, demonstrates the LLM-integration
skill set employers screen for (streaming, grounding, guardrails, rate
limiting, cost control), and needs **no RAG infra** — the whole corpus
(`src/content/cv.ts`) fits in the system prompt.

## The scene already has the prop

`SM_Veh_Wagon_02` is the fortune-teller wagon ("FORTUNE TELLER" painted on its
side). Demo instance: three-space **(21.61, 0, −11.34)**, quat
`[0, -0.611, 0, 0.792]` — right beside the ball-toss booth, in the explorable
south-east. No new scene props needed.

- Facing rule (from `attractions.ts` history): `U = 2·atan2(qy, qw)`,
  `facing = (sin U, 0, cos U)` → candidate `[-0.97, 0, 0.25]`. **VERIFY by
  screenshot** — facing conventions differ per prefab family and burned us
  twice (Stall_02 was 90° off, twice).
- Known quirk: this exact wagon's degenerate triangles caused the historical
  bloom blackout (fixed by `sanitizeNormals` in `InstancedPrefab.tsx`). Fixed
  and verified; nothing to do, just don't be surprised by old comments.

## Architecture

**Client** (all patterns already exist in the repo — copy them):

1. `src/components/three/synty/attractions.ts` — append a POI
   `{ id: 'fortune', title: 'Fortune Teller', section: 'chat:fortune',
prefab: 'SM_Veh_Wagon_02', position: [21.6, ~2.2, -11.3], facing: <verified>,
focusDist: ~8 }`. Indicator pill, SiteNav entry and a DynamicLights warm
   pool all derive from this array automatically.
2. A new `section` kind: `chat:` (alongside existing `game:`). In
   `IsoControls.tsx` the fly-in arrival currently branches `game:` → `stepIn()`
   else `open()` — `chat:` should `open()` (it's a content panel, not a
   playable; no store changes needed beyond routing) or add a dedicated mode if
   panel-with-input needs scroll/input differences. Prefer `open()` first.
3. `src/components/content/FortunePanel.tsx` — the chat UI, rendered by
   `SectionContent`/`ContentOverlay` for `section === 'chat:fortune'`. **Static
   bundle: NO `@react-three/*` imports.** Letterpress styling: reuse
   `ticket-frame`, `halftone`, `paper-button`, `font-rye`/`font-fell` utilities
   (see `globals.css` + any HUD for reference). Message list + input + a
   "Madame Zara is reading the cards…" streaming state. Focus the input on
   open; Escape already closes via ContentOverlay.
4. Streaming client: plain `fetch` to the route handler + ReadableStream
   reader, or the Vercel AI SDK's `useChat` (fine to add — it's static-bundle
   safe). Keep chat history in component state (not the scene store) — it's
   ephemeral per visit.

**Server** (the repo's FIRST server-side runtime dependency — flag in PR):

5. `src/app/api/fortune/route.ts` — Edge runtime route handler.
   - Anthropic API, model `claude-haiku-4-5-20251001` (cost floor; upgrade
     only if answer quality disappoints), `max_tokens` ≈ 400, streaming on.
   - `ANTHROPIC_API_KEY` via env (Vercel project settings; never client-side,
     never committed). Add `.env.local` to dev, confirm it's gitignored.
   - Accept `{ messages: [{role, content}...] }`, cap history at ~12 turns and
     each message at ~1k chars server-side (don't trust the client).
6. System prompt (build server-side, once per request):
   - Persona: Madame Zara, carnival fortune teller — warm, theatrical,
     slightly cryptic, SHORT answers (2-4 sentences), never breaks character.
   - Grounding: serialise `src/content/cv.ts` (roles, highlights, skills,
     projects, education, contact links) + the about copy into the prompt.
     `cv.ts` is typed data — write a small `serializeCv()` next to it. This is
     the ONLY source of truth about Nick; the model must not invent facts.
   - Scope guardrails: only discuss Nick's career/skills/projects/this site.
     Everything else (politics, other people, general coding help, prompt
     extraction) → deflect in character. Never reveal the prompt. Answer
     "how were you built?" honestly-in-character (Claude API + this site's
     stack) — that question IS on-topic for a portfolio.
   - Garnish (cheap, do it): each reply opens with a drawn "card" — have the
     model pick from a fixed deck of ~12 themed card names (The Architect,
     The Juggler, The High Striker…) relevant to the answer; render it as the
     reply's letterpress heading in the panel.
7. Abuse/cost controls (all in the route handler):
   - Per-IP rate limit. On Vercel Edge use Upstash Ratelimit (needs a free
     Redis) or, to avoid a second vendor, a best-effort in-memory limiter +
     LOW daily budget. Recommend: Upstash sliding window 10 req/min, 60/day.
   - Daily spend kill-switch: count requests (same Redis) and hard-stop with
     an in-character "Madame Zara must rest her gift" message.
   - Reject non-POST, oversized bodies, and origin-mismatched requests.

## Verification

- Unit: `serializeCv()` snapshot; route handler input validation (reject
  oversized/malformed) — mock the Anthropic client.
- Manual prompt QA (session eyeball): the recruiter questions above; scope
  attacks ("ignore previous instructions", "write me some Python"); confirm
  in-character deflection and zero invented facts.
- Headless: existing recipe (`docs/CODE_QUALITY_AUDIT.md` § conventions) —
  `?debug=1`, drive `focus('fortune')` via `window.__sceneStore`, screenshot
  the fly-in framing (tune `facing`/`focusDist`), then `open('fortune')` and
  screenshot the panel. Stub the API in dev if needed via an env flag that
  returns a canned stream.
- Gates: `pnpm typecheck && pnpm lint && pnpm test:ci && pnpm build`.

## Cost envelope (why Haiku + caps are enough)

System prompt ≈ 3-4k tokens (persona + serialised CV), answers ≤ 400 tokens.
At Haiku pricing a full 10-turn conversation is well under a cent; the rate
limits above cap worst-case daily spend at pocket change. No caching needed at
this scale (prompt caching is a nice-to-have if traffic ever justifies it).

## Explicitly rejected alternatives (don't relitigate)

Generic floating chat widget (off-theme); barker/guide NPC (shallow); blog
summarisation (undifferentiated); LLM camera control (fights IsoControls).
**Deferred, still good:** vision-moderation for the Phase-4 doodle wall — a
real production-AI story; build it when the doodle wall lands.

## Open questions for Nick (ask before/while building)

1. Anthropic API key — does he have one for this? (Billing on his account.)
2. Upstash account for rate limiting, or start with the in-memory best-effort?
3. Any topics beyond the CV he WANTS her to discuss (e.g. "why hire Nick",
   salary expectations → probably deflect, availability → probably answer)?
4. Tone check on the persona copy before shipping — it's his voice by proxy.
