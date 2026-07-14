-- Doodle wall (ADR-0001): the tiles table, its pre-moderation queue, and
-- public wall reads. Reviewed-only until Nick provisions the Supabase
-- project — this file runs at that gate, never in CI.
--
-- RLS here is the backstop: the API routes run with the service-role key
-- (bypassing RLS) and tileService enforces every rule below first. The
-- policies exist so a leaked anon key still cannot read the queue or
-- promote a tile.

-- One row per visitor contribution (a tile, CONTEXT.md).
create table public.tiles (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  status text not null default 'pending'
    constraint tiles_status_check check (status in ('pending', 'approved', 'rejected')),
  submitter_hash text not null,
  created_at timestamptz not null default now(),
  -- Null until Stage 2 moderation approves the tile.
  approved_at timestamptz
);

-- The wall query: most-recent approved, newest first. Partial index — the
-- approved subset stays small and pending/rejected rows never bloat it.
create index tiles_wall_idx on public.tiles (created_at desc)
  where status = 'approved';

-- The daily-cap count: equality column (submitter_hash) first, range column
-- (created_at) last, per the leftmost-prefix rule.
create index tiles_submitter_window_idx on public.tiles (submitter_hash, created_at);

alter table public.tiles enable row level security;

-- Anon may insert only into the pre-moderation queue — a submission can
-- never arrive pre-approved.
create policy "anon submits tiles as pending only"
  on public.tiles
  for insert
  to anon
  with check (status = 'pending');

-- Anon may read only approved tiles; the queue is invisible publicly.
create policy "anon reads approved tiles only"
  on public.tiles
  for select
  to anon
  using (status = 'approved');

-- No anon update/delete policies: status changes are admin-only (Stage 2).

-- Storage bucket for tile PNGs: public read, no public write. The bucket
-- itself pins the content type and the 128 KB tile cap (defence in depth —
-- tileService enforces both before any upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tiles', 'tiles', true, 131072, array['image/png'])
on conflict (id) do nothing;

-- Public read of tile images. No insert/update/delete policies exist for
-- this bucket, so writes only happen through the server adapter
-- (service role), which pins contentType image/png.
create policy "public read of tile images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'tiles');
