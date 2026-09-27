-- Backfilled into the repo on 2026-09-26 by Claude, matching the Phase 0
-- practice: applied directly to production via the Supabase MCP tools
-- first, then written here afterward so `supabase db push` / a fresh
-- clone stays in sync with what's actually deployed.
--
-- Phase 1 of the discovery-pipeline rollout: adds the columns and the
-- multi-tier dedup RPC the discover-store Edge Function depends on.
-- Does NOT touch `stores` writes, promote_suggestion(), or
-- stores.import_source -- those are Phase 2 (the Admin Dashboard review
-- flow), deliberately kept separate since promoting a suggestion needs
-- values (location, categories, main_category) that suggestions don't
-- capture, and slug generation should reuse src/utils/slugify.ts rather
-- than a hand-rolled SQL version.

begin;
alter table public.store_suggestions
  add column if not exists source              text not null default 'public_form',
  add column if not exists source_ref          text,
  add column if not exists category_hint       text,
  add column if not exists main_category       text,
  add column if not exists google_place_id     text,
  add column if not exists location            geography(Point, 4326),
  add column if not exists geocode_confidence  text,
  add column if not exists possible_duplicate_of uuid references public.stores(id),
  add column if not exists times_seen          int not null default 1,
  add column if not exists last_seen_at        timestamptz not null default now();

alter table public.store_suggestions drop constraint if exists store_suggestions_source_check;
alter table public.store_suggestions add constraint store_suggestions_source_check
  check (source in ('public_form', 'discovery_bot'));

alter table public.store_suggestions drop constraint if exists store_suggestions_geocode_confidence_check;
alter table public.store_suggestions add constraint store_suggestions_geocode_confidence_check
  check (geocode_confidence is null or geocode_confidence in ('high', 'low', 'none'));

alter table public.store_suggestions drop constraint if exists store_suggestions_email_required_for_public;
alter table public.store_suggestions add constraint store_suggestions_email_required_for_public
  check (source <> 'public_form' or submitter_email is not null) not valid;

create index if not exists store_suggestions_google_place_id_idx
  on public.store_suggestions (google_place_id) where google_place_id is not null;
create index if not exists store_suggestions_instagram_lower_idx
  on public.store_suggestions (lower(instagram)) where instagram is not null;
create index if not exists stores_instagram_lower_idx
  on public.stores (lower(instagram)) where instagram is not null;
create index if not exists store_suggestions_status_idx
  on public.store_suggestions (status, created_at desc);

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
    and similarity(s.normalized_name, c.norm_name) >= 0.45
  union all
  select 'store_suggestions'::text, ss.id, 'fuzzy_name'::text, false
  from public.store_suggestions ss, candidate c
  where c.norm_name <> '' and ss.status = 'pending' and lower(ss.city) = lower(p_city)
    and ss.normalized_name <> '' and similarity(ss.normalized_name, c.norm_name) >= 0.45
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
