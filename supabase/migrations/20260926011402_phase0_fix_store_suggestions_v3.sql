-- Phase 0 of the discovery-pipeline rollout: brings store_suggestions back
-- in line with what SuggestStoreForm.tsx and AdminDashboard.tsx already
-- expect, and adds Unicode-safe dedup support for both store_suggestions
-- and stores.
--
-- promote_suggestion() and the stores.import_source change from the
-- original design were deliberately left out of this migration: promoting
-- a suggestion into `stores` needs values (location, categories,
-- main_category) that suggestions don't capture, and slug generation
-- should reuse src/utils/slugify.ts rather than a hand-rolled SQL version.
-- Both belong in the Phase 1 discover-store Edge Function instead.
--
-- Two things had to be fixed before this applied cleanly to production:
--  1. unaccent() is STABLE, not IMMUTABLE, so Postgres rejects it inside a
--     GENERATED ALWAYS AS (...) STORED expression (42P17). Fixed by
--     wrapping it in an IMMUTABLE SQL function.
--  2. Postgres regex does not support \p{L}/\p{N} Unicode property
--     escapes (2201B invalid escape). Fixed by using the POSIX class
--     [[:alnum:]], which is locale-aware (db collation is en_US.UTF-8) and
--     was verified directly against Japanese text before use.

begin;

create extension if not exists unaccent;
create extension if not exists pg_trgm;

create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
parallel safe
as $$
  select unaccent('unaccent', $1)
$$;

alter table public.store_suggestions
  add column if not exists submitter_name  text,
  add column if not exists submitter_email text,
  add column if not exists country         text,
  add column if not exists address         text,
  add column if not exists reason          text,
  add column if not exists status          text not null default 'pending';

update public.store_suggestions
set status = case when reviewed then 'approved' else 'pending' end
where status = 'pending';

alter table public.store_suggestions
  drop constraint if exists store_suggestions_status_check;
alter table public.store_suggestions
  add constraint store_suggestions_status_check
  check (status in ('pending','approved','rejected'));

alter table public.store_suggestions
  add column if not exists normalized_name text
  generated always as (
    lower(regexp_replace(public.immutable_unaccent(store_name), '[^[:alnum:]]+', '', 'g'))
  ) stored;

create index if not exists store_suggestions_normalized_name_trgm_idx
  on public.store_suggestions using gin (normalized_name gin_trgm_ops);

alter table public.stores
  add column if not exists normalized_name text
  generated always as (
    lower(regexp_replace(public.immutable_unaccent(name), '[^[:alnum:]]+', '', 'g'))
  ) stored;

create index if not exists stores_normalized_name_trgm_idx
  on public.stores using gin (normalized_name gin_trgm_ops);

alter table public.store_suggestions
  drop constraint if exists store_suggestions_shape_check;

alter table public.store_suggestions
  add constraint store_suggestions_shape_check check (
    char_length(store_name) between 1 and 200
    and char_length(city) between 1 and 100
    and (neighborhood is null or char_length(neighborhood) <= 100)
    and (instagram is null or char_length(instagram) <= 200)
    and (website is null or char_length(website) <= 500)
    and (notes is null or char_length(notes) <= 2000)
    and (submitter_name is null or char_length(submitter_name) <= 200)
    and (submitter_email is null or char_length(submitter_email) <= 320)
    and (country is null or char_length(country) <= 100)
    and (address is null or char_length(address) <= 300)
    and (reason is null or char_length(reason) <= 2000)
  ) not valid;

drop policy if exists "Admins can view suggestions" on public.store_suggestions;
create policy "Admins can view suggestions"
  on public.store_suggestions for select
  to authenticated
  using (public.is_user_admin());

drop policy if exists "Admins can update suggestions" on public.store_suggestions;
create policy "Admins can update suggestions"
  on public.store_suggestions for update
  to authenticated
  using (public.is_user_admin())
  with check (public.is_user_admin());

commit;
