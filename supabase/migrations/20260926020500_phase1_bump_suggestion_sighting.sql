-- Backfilled into the repo on 2026-09-26 by Claude (see note in
-- 20260926020000_phase1_discovery_columns_and_dedup_rpc.sql).
--
-- Atomic increment for the discover-store Edge Function: when a candidate
-- matches an existing *pending* suggestion, this bumps times_seen /
-- last_seen_at in one round trip instead of a non-atomic read-then-write
-- from JS (which would race under concurrent bot submissions).

create or replace function public.bump_suggestion_sighting(p_id uuid)
returns table (times_seen int)
language sql
set search_path = 'public', 'pg_temp'
as $$
  update public.store_suggestions
  set times_seen = times_seen + 1, last_seen_at = now()
  where id = p_id
  returning times_seen;
$$;
revoke all on function public.bump_suggestion_sighting(uuid) from public;
grant execute on function public.bump_suggestion_sighting(uuid) to service_role;
