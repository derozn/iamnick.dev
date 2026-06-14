# 0001 — Doodle wall runs on Supabase with a pre-moderation queue

The doodle wall (a communal stall where visitors draw tiles others can see) turns the previously static, backend-free portfolio into one with a writable, persisted store. We will use **Supabase** — Postgres for tile rows + status, Storage for the small PNG tile images, and Supabase Auth (Google OAuth) for the single-moderator admin view — chosen because Nick already runs Supabase in other projects and it bundles database, storage, and auth in one free tier. Tiles are **persisted, not live**; the wall shows a bounded set of the most recent **approved** tiles; every submission lands in a **pre-moderation queue** that only Nick can approve before anything is shown publicly.

## Considered options

- **Vercel-native** (Vercel Postgres/Neon + Vercel Blob) — single platform, but rejected in favour of Nick's existing Supabase familiarity.
- **Turso (edge SQLite)** — cheap and no idle-pause, but no object storage and an extra vendor. Rejected.

## Consequences

- **Idle pause:** Supabase free-tier projects pause after ~1 week of inactivity, so a sporadically-visited portfolio could serve a cold/asleep wall. Mitigate with a free scheduled keepalive (daily cron ping to the DB); only consider the paid tier if traffic warrants.
- **Admin gating:** the moderation view MUST hard-allow-list Nick's specific Google account — "any successful Google login" is not sufficient.
- **No realtime:** newly approved tiles appear on next page load / poll, which is acceptable for the persisted gallery model and avoids standing websocket infrastructure.
- Submissions are rate-limited per session/IP to prevent queue flooding.
