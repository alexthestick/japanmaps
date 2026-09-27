-- Backfilled into the repo on 2026-09-26 by Claude (see note in
-- 20260926020000_phase1_discovery_columns_and_dedup_rpc.sql).
--
-- Fix for a real gap found during round-trip testing: pg_trgm similarity()
-- penalizes length mismatches heavily, so a short bot-supplied name (e.g.
-- "MISMATCH") scores well below the 0.45 fuzzy threshold against a real
-- store name that includes a tagline (e.g. "MISMATCH OSAKA - Japanese
-- Culture J-pop Tees"), even though a human reviewer would instantly
-- recognize them as the same store. This is common: bots/scrapers often
-- pull just the IG display name, which is frequently a prefix of the
-- fuller name stored on the map.
--
-- Fix: in addition to trigram similarity, treat a normalized-name prefix
-- match (either direction, min 4 chars to avoid trivial false positives
-- like "the") as a fuzzy_name tier hit. This is still the weak/non-confident
-- tier -- it inserts and flags via possible_duplicate_of, never silently
-- drops -- so a wrong prefix match just means Alex sees an extra flag at
-- review time, not a lost candidate.

begin;

create or replace function public.find_store_duplicates(
  p_name text, p_city text, p_instagram text default null,
  p_google_place_id text default null, p_lng double precision default null, p_lat double precision default null
)
returns table (match_table text, match_id uuid, tier text, confident boolean)
language sql stable set search_path = 'public', 'pg_temp'
as $$
  with candidate as (
    select
      lower(regexp_replace(public.immutable_unaccent(p_name), '[^[:alnum:]]+', '', 'g')) as norm_name,
      nullif(lower(regexp_replace(coalesce(p_instagram, ''), '^@|/+$', '', 'g')), '') as norm_instagram,
      case when p_lng is not null and p_lat is not null
        then ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography else null end as pt
  )
  select 'stores'::text, s.id, 'google_place_id'::text, true
  from public.stores s, candidate c
  where p_google_place_id is not null and s.google_place_id = p_google_place_id
  union all
  select 'store_suggestions'::text, ss.id, 'google_place_id'::text, true
  from public.store_suggestions ss, candidate c
  where p_google_place_id is not null and ss.google_place_id = p_google_place_id and ss.status = 'pending'
  union all
  select 'stores'::text, s.id, 'instagram'::text, true
  from public.stores s, candidate c
  where c.norm_instagram is not null
    and lower(regexp_replace(s.instagram, '^@|/+$', '', 'g')) = c.norm_instagram
  union all
  select 'store_suggestions'::text, ss.id, 'instagram'::text, true
  from public.store_suggestions ss, candidate c
  where c.norm_instagram is not null and ss.status = 'pending'
    and lower(regexp_replace(ss.instagram, '^@|/+$', '', 'g')) = c.norm_instagram
  union all
  select 'stores'::text, s.id, 'fuzzy_name'::text, false
  from public.stores s, candidate c
  where c.norm_name <> '' and lower(s.city) = lower(p_city) and s.normalized_name <> ''
    and (
      similarity(s.normalized_name, c.norm_name) >= 0.45
      or (length(c.norm_name) >= 4 and s.normalized_name like c.norm_name || '%')
      or (length(s.normalized_name) >= 4 and c.norm_name like s.normalized_name || '%')
    )
  union all
  select 'store_suggestions'::text, ss.id, 'fuzzy_name'::text, false
  from public.store_suggestions ss, candidate c
  where c.norm_name <> '' and ss.status = 'pending' and lower(ss.city) = lower(p_city)
    and ss.normalized_name <> ''
    and (
      similarity(ss.normalized_name, c.norm_name) >= 0.45
      or (length(c.norm_name) >= 4 and ss.normalized_name like c.norm_name || '%')
      or (length(ss.normalized_name) >= 4 and c.norm_name like ss.normalized_name || '%')
    )
  union all
  select 'stores'::text, s.id, 'geo_proximity'::text, false
  from public.stores s, candidate c
  where c.pt is not null and c.norm_name <> '' and s.normalized_name <> ''
    and ST_DWithin(s.location, c.pt, 75) and similarity(s.normalized_name, c.norm_name) >= 0.3
  limit 20;
$$;
revoke all on function public.find_store_duplicates(text, text, text, text, double precision, double precision) from public;
grant execute on function public.find_store_duplicates(text, text, text, text, double precision, double precision) to service_role;

commit;
