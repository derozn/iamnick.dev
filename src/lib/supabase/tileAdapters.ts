import {
  InMemoryTileImageStore,
  InMemoryTileRepository,
  seedApprovedTiles,
} from '@/lib/doodle-wall/fakes';
import type { TileImageStore, TileRepository } from '@/lib/doodle-wall/ports';

import { createServerClient } from './serverClient';
import { SupabaseTileImageStore } from './tileImageStore';
import { SupabaseTileRepository } from './tileRepository';

/**
 * The single place adapter selection happens (akin to FORTUNE_STUB): with
 * any of SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
 * absent, both API routes run against the in-memory fakes — dev, CI, and
 * the currently-unprovisioned production are all keyless. The anon key is
 * unused here (it is declared for Stage 2 admin auth) but still gates stub
 * mode so a half-configured environment cannot half-work.
 */

export interface TileAdapters {
  repository: TileRepository;
  imageStore: TileImageStore;
  submitterHashSecret: string;
  /** true = real Supabase; false = in-memory stub mode. */
  live: boolean;
}

/**
 * Fixed hashing secret for stub mode only — fakes never leave the instance,
 * so predictable hashes cost nothing. With real Supabase env present a
 * missing SUBMITTER_HASH_SECRET fails loudly instead (see below).
 */
export const DEV_SUBMITTER_HASH_SECRET = 'doodle-wall-dev-only-secret';

let fakes: { repository: TileRepository; imageStore: TileImageStore } | null = null;
let supabase: { repository: TileRepository; imageStore: TileImageStore } | null = null;

export function getTileAdapters(): TileAdapters {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    // A HALF-configured environment is a misconfiguration, not stub mode:
    // silently serving fakes after provisioning (a rotated-out key, a renamed
    // var) would 201 visitors' tiles into per-instance memory and lose them.
    // Fully keyless stays legal — that is pre-provisioning stub mode.
    if ((url || anonKey || serviceRoleKey) && process.env.VERCEL_ENV === 'production') {
      throw new Error(
        '[doodle-wall] partial Supabase env in production — set all of SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY or none',
      );
    }
    // Stub mode — module-level singletons so the seeded wall and submitted
    // tiles persist across requests within an instance.
    fakes ??= {
      repository: new InMemoryTileRepository(seedApprovedTiles()),
      imageStore: new InMemoryTileImageStore(),
    };
    return {
      ...fakes,
      submitterHashSecret: process.env.SUBMITTER_HASH_SECRET || DEV_SUBMITTER_HASH_SECRET,
      live: false,
    };
  }

  const submitterHashSecret = process.env.SUBMITTER_HASH_SECRET;
  if (!submitterHashSecret) {
    // Real backend + dev fallback would persist guessable submitter hashes
    // (HMAC under a public constant) — refuse to run rather than degrade.
    throw new Error(
      '[doodle-wall] SUBMITTER_HASH_SECRET is required when the Supabase env is configured',
    );
  }

  if (!supabase) {
    const client = createServerClient(url, serviceRoleKey);
    supabase = {
      repository: new SupabaseTileRepository(client),
      imageStore: new SupabaseTileImageStore(client),
    };
  }
  return { ...supabase, submitterHashSecret, live: true };
}

/** Test hook: drop the singletons so each case starts from the seed. */
export function resetTileAdapters(): void {
  fakes = null;
  supabase = null;
}
