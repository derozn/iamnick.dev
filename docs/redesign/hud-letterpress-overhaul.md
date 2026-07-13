# HUD Letterpress Overhaul + Atmospheric Lighting — As-Built

> **Status: in progress, first pass landed.** This session moved the site chrome from the
> original cyberpunk-neon HUD toward an **aged sideshow-poster / letterpress** aesthetic, and
> re-graded the 3-D scene lighting toward the Synty _POLYGON Horror Carnival_ promo shots.
> Reference: `~/Downloads/horror-carnival-hud-{spec.md,reference.html}` and the two promo
> stills Nick supplied. The look is established and applied across all live HUD surfaces; the
> lighting is a first pass pending fine-tuning on a real GPU (§5).

---

## 1. The letterpress theme system (reusable foundation)

All of it lives in `src/styles/globals.css` so the rest of the overhaul builds on it.

**Tokens (`@theme`)** — carnival inks on bone stock, from the spec §2.1:
`--color-paper #e6dabd`, `--color-ink #2a2017`, `--color-ink-soft #5c4a36`,
`--color-oxblood #6f2722`, `--color-oxblood-bright #8a322a`, `--color-brass #a3823f`,
`--color-brass-text #7d5f2b`, `--color-keyline #241a12`. These generate the usual Tailwind
utilities (`bg-paper`, `text-ink`, `text-oxblood`, `border-keyline`, …).

**Fonts** — period faces via `next/font/google` in
`src/lib/fonts/google.ts`: **Rye** (wood-type display), **IM Fell
English** (body, roman + italic), **IM Fell English SC** (small-caps). Self-hosted at build
(no client Google calls). Wired into `<html>` in `layout.tsx`.

- **Gotcha:** the raw `next/font` CSS vars are suffixed `-src` (`--font-rye-src`, …) so the
  `@theme` tokens (`--font-rye: var(--font-rye-src), 'Rye', serif`) can layer fallbacks
  **without referencing themselves** — name them the same and the font silently falls back to
  `serif`. Utilities: `font-rye`, `font-fell`, `font-fell-sc`.

**Utilities (`@utility`):**

- `ticket-frame` — bone fill + foxing + the spec's double-rule emboss `box-shadow` stack.
- `ticket-perf` — punched tear-off perforation strip (pair with left padding).
- `letterpress` — 1px light text-shadow = the deboss illusion (on ink/brass text).
- `halftone` — faint ben-day dot screen (`::after`, multiply) so ink reads printed.
- `paper-button` — beveled bone keycap (oxblood text, hover oxblood-bright).
- `paper-chip` — outline ticket-stub chip (brass ink, hairline keyline) for tech tags.

The old neon utilities (`hud-card`, `hud-button`, `hud-chip`) remain defined but are no longer
used by live HUD surfaces.

---

## 2. Career booth → stacked ticket deck

`src/components/overlays/CareerTickets.tsx` — the Career section is now a **deck of carnival
tickets** shuffled one role at a time (decisions locked with Nick: full letterpress · prev/next
stepper · condensed face that expands).

- Reads `roles` from `@/content/cv` (newest-first), `formatYearMonth` for dates, `motion/react`
  for the swap.
- **Condensed face:** dates (brass SC) · company (Rye) · title (IM Fell italic) · location
  (fleuron ❦) · blurb · tech (`paper-chip`). **"read the bill"** expands the role's highlights.
- **Navigation:** brass `‹ ›` stepper + `←/→` keys (wraps the deck); roman-numeral counter
  `❦ III of VII ❦`. Peek tickets fanned behind read as a stack. Reduced-motion → instant swap.
- **Integration:** `ContentOverlay` branches `section === 'work'` onto its own letterpress stage
  (no neon card), reusing the existing backdrop / ✕ / Escape / scroll-lock. `Work()` was removed
  from `SectionContent`; `RolePanel` + the `role:` branch are untouched.

---

## 3. HUD surfaces converted to letterpress

- **`ContentOverlay.tsx`** — every section now opens on a bone `ticket-frame halftone` panel
  (career = the deck) with a shared **grain + vignette** filmic pass and a `paper-button` brass
  ✕. Grain/vignette are scoped to the overlay (the spec's global pass is a later step).
- **`SectionContent.tsx`** — Kicker = brass IM Fell SC + hairline rule; headings = Rye; body =
  IM Fell; bullets = ❦; tech = `paper-chip`; contact actions = `paper-button`.
- **`SiteNav.tsx` (menu)** — links are letterpress small-caps in a bone `ticket-frame` pill
  (oxblood hover, dimmed disabled). **The `iamnick.dev` wordmark is intentionally left in the
  original brand styling — do not letterpress it (Nick's branding).**
- **`Indicators` (`.iso-indicator` in globals.css)** — booth markers went from neon dots to bone
  brass tags with an oxblood pulse; label still unfurls on hover.
- **`BallTossHud.tsx`** — bone `ticket-frame` score/balls chip, `paper-button` exit + actions,
  bone aiming-hint pill, and intro/won/lost cards as bone tickets (Rye headings, brass kickers).

---

## 4. Atmospheric lighting (toward the promo shots)

The live iso scene is lit by `src/components/three/synty/DynamicLights.tsx` (a base rig + a
moving pool of point lights that snap to the nearest candidate glows) and graded in
`src/components/three/Scene.tsx`. **No post-processing** (EffectComposer/Bloom was removed
earlier — it caused the black-flicker/context-loss; bulbs glow via emissive).

The old rig washed everything in a flat cool light. Re-graded for the promo's deep-night +
dominant firelight:

| Knob (DynamicLights base rig) | Was       | Now                                                    |
| ----------------------------- | --------- | ------------------------------------------------------ |
| `ambientLight` intensity      | 0.72      | **0.28** (`#2c2440`)                                   |
| `hemisphereLight` intensity   | 1.55      | **0.6** (sky `#46588f` / warm-violet ground `#2a1f2c`) |
| moon key `directionalLight`   | 1.25      | **0.85** (cool `#aab6f0`)                              |
| violet rim `directionalLight` | 0.6       | **0.8** (`#a86cff`)                                    |
| warm lamp/pumpkin pools       | i8 / d8   | **i13 / d11**                                          |
| per-attraction warm pool      | i10 / d12 | **i15 / d14**                                          |

`Scene.tsx` tone-mapping: **AgX → ACES Filmic**, exposure **1.45 → 1.15** (AgX read too flat /
desaturated; ACES gives the promo's saturated, punchy firelight). Fog unchanged
(`#0e0b1c`, fogExp2 density 0.013 high / 0.018 low).

**Tuning levers** (all in those two files, HMR-live, no rebuild):

- too dark in dead zones → lift `ambientLight` 0.28→0.33 or hemisphere;
- not warm/punchy enough → exposure 1.15→1.25, warm the firelight colour, or grow pool reach;
- shadows too blue/purple → shift the hemisphere ground + ambient hue;
- fog → warm it for haze or thin it for distance read.

---

## 5. Verification & known follow-ups

- **Gates green** at handback: `pnpm typecheck` · `pnpm lint` · `pnpm test:ci`.
- **Headless recipe** = the ball-toss doc §6 (launch with `reducedMotion:'no-preference'`,
  frame-pump screenshots). Confirmed: menu, bone indicators, career deck (open / advance /
  expand / arrow-keys), ball-toss intro + in-game HUD, and the re-graded scene.
- **Headless colour caveat:** screenshots are software (swiftshader) — directional for
  composition/contrast only. **Lighting tone/colour must be judged on the real Mac GPU.**

**Follow-ups:**

- A non-career content panel (About/Projects/Contact) was **not** screenshotted headless — those
  booth indicators sit off the default viewport. It reuses the verified `ticket-frame` wrapper +
  tokens, but eyeball it on the Mac.
- The game's exit ✕ and the top-right nav pill both anchor top-right and may sit close (pre-existing
  layout). Decide whether the game should hide the nav or move the ✕.
- Lighting is a **first pass** — fine-tune on the Mac per §4 levers.
- Global grain/vignette over the whole frame (spec §7) and the other survival-HUD widgets are
  out of scope (not part of this portfolio).
