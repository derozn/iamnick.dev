# Role-based component folders; the dormant organisms layer is deleted, not revived

Status: accepted (2026-07-13)

The v1 portfolio's atomic-design migration was abandoned midway: five section
organisms (`HeaderSection`, `RoleSection`, `EarlierRolesSection`,
`SideProjectsSection`, `ContactSection`) were built, tested and exported but
never rendered — the live page serves CV content through `StaticCv`'s
(né `StaticResume`) inline sections instead. Import-tracing (July 2026)
showed the entire supporting apparatus — `MotionCard`, `SectionShell`,
`atoms/Asset`, `atoms/Animation/Fade`, `ui-modules/next/image`,
`src/modules/Interactive/Portrait` — existed only to serve that dormant layer.

**Decision:** delete the dormant layer and its cascade, and organize
`src/components/` by role — `ui/ overlays/ cv/ nav/ three/` — not by
atomic-design rank. `StaticCv` is deliberately the sole DOM renderer of CV
content; the reduced-motion/no-canvas tier depends on it directly. Client code
may not import `@/content/cv` (lint-enforced; `SectionContent` and
`CareerTickets` are the two recorded exceptions).

**Rejected:** reviving the organisms and composing `StaticCv` from them
(completes the abandoned migration, but builds reuse for a DOM-first view that
isn't planned); strict atomic design with a molecules layer (classifies
components by composition rank, which fits a component library, not an app
that is one canvas plus overlays).

If a DOM-first view ever ships, the section components are recoverable from
git history at this ADR's commit — do not rebuild them from scratch.
