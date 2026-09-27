-- Backfilled into the repo by Claude, matching Phase 0/1 practice.
--
-- Phase 2 fix for the "hard wall" requirement: a candidate Alex has already
-- rejected must never quietly re-queue just because Muse re-finds it later.
-- Phase 1's find_store_duplicates() only matched pending store_suggestions
-- rows, so a rejected row was invisible to dedup and a re-submission would
-- insert a brand new suggestion as if it were novel.
--
-- Fix: match against store_suggestions rows with status in ('pending',
-- 'rejected'), and return a new `status` column so the Edge Function can
-- tell the two cases apart and respond with a distinct `already_rejected`
-- status (still bumping times_seen/last_seen_at) instead of the generic
-- `already_queued`. Approved rows are deliberately NOT matched here --
-- once approved, a suggestion is promoted to a real store, and the
-- google_place_id/instagram tiers against the `stores` table already cover
-- "this is on the map now".
--
-- The return signature changed (added `status text`), so this drops and
-- recreates the function rather than `create or replace` -- Postgres
-- refuses to change a function's OUT-parameter row type in place
-- (42P13: cannot change return type of existing function).

begin;

drop function if exists public.find_store_duplicates(text, text, text, text, double precision, double precision);

create function public.find_store_duplicates(
  p_name text, p_city text, p_instagram text default null,
  p_google_place_id text default null, p_lng double precision default null, p_lat double precision default null
)
returns table (match_table text, match_id uuid, tier text, confident boolean, status text)
language sql stable set search_path = 'public', 'pg_temp'
as $$
  with candidate as (
    select
      lower(regexp_replace(public.immutable_unaccent(p_name), '[^[:alnum:]]+', '', 'g')) as norm_name,
      nullif(lower(regexp_replace(coalesce(p_instagram, ''), '^@|/+$', '', 'g')), '') as norm_instagram,
      case when p_lng is not null and p_lat is not null
        then ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography else null end as pt
  )
  select 'stores'::text, s.id, 'google_place_id'::text, true, null::text
  from public.stores s, candidate c
  where p_google_place_id is not null and s.google_place_id = p_google_place_id
  union all
  select 'store_suggestions'::text, ss.id, 'google_place_id'::text, true, ss.status
  from public.store_suggestions ss, candidate c
  where p_google_place_id is not null and ss.google_place_id = p_google_place_id
    and ss.status in ('pending', 'rejected')
  union all
  select 'stores'::text, s.id, 'instagram'::text, true, null::text
  from public.stores s, candidate c
  where c.norm_instagram is not null
    and lower(regexp_replace(s.instagram, '^@|/+$', '', 'g')) = c.norm_instagram
  union all
  select 'store_suggestions'::text, ss.id, 'instagram'::text, true, ss.status
  from public.store_suggestions ss, candidate c
  where c.norm_instagram is not null and ss.status in ('pending', 'rejected')
    and lower(regexp_replace(ss.instagram, '^@|/+$', '', 'g')) = c.norm_instagram
  union all
  select 'stores'::text, s.id, 'fuzzy_name'::text, false, null::text
  from public.stores s, candidate c
  where c.norm_name <> '' and lower(s.city) = lower(p_city) and s.normalized_name <> ''
    and (
      similarity(s.normalized_name, c.norm_name) >= 0.45
      or (length(c.norm_name) >= 4 and s.normalized_name like c.norm_name || '%')
      or (length(s.normalized_name) >= 4 and c.norm_name like s.normalized_name || '%')
    )
  union all
  select 'store_suggestions'::text, ss.id, 'fuzzy_name'::text, false, ss.status
  from public.store_suggestions ss, candidate c
  where c.norm_name <> '' and ss.status in ('pending', 'rejected') and lower(ss.city) = lower(p_city)
    and ss.normalized_name <> ''
    and (
      similarity(ss.normalized_name, c.norm_name) >= 0.45
      or (length(c.norm_name) >= 4 and ss.normalized_name like c.norm_name || '%')
      or (length(ss.normalized_name) >= 4 and c.norm_name like ss.normalized_name || '%')
    )
  union all
  select 'stores'::text, s.id, 'geo_proximity'::text, false, null::text
  from public.stores s, candidate c
  where c.pt is not null and c.norm_name <> '' and s.normalized_name <> ''
    and ST_DWithin(s.location, c.pt, 75) and similarity(s.normalized_name, c.norm_name) >= 0.3
  limit 20;
$$;
revoke all on function public.find_store_duplicates(text, text, text, text, double precision, double precision) from public;
grant execute on function public.find_store_duplicates(text, text, text, text, double precision, double precision) to service_role;

commit;
