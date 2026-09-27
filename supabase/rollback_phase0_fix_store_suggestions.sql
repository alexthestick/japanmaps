-- Rollback for 20260926011402_phase0_fix_store_suggestions_v3.sql and
-- 20260926011703_phase0_pin_search_path.sql.
--
-- NOT a migration file on purpose -- keep it out of supabase/migrations/
-- so `supabase db push` never applies it automatically. Run by hand only,
-- e.g. via the Supabase SQL editor or `mcp__Supabase__execute_sql`.
--
-- Safe to run any time after Phase 0: it only removes what that migration
-- added and does not touch the original store_suggestions/stores columns,
-- suggestions_insert policy, or any submitted data in the columns that
-- predate Phase 0.

begin;

drop policy if exists "Admins can update suggestions" on public.store_suggestions;
drop policy if exists "Admins can view suggestions" on public.store_suggestions;

alter table public.store_suggestions drop constraint if exists store_suggestions_shape_check;
alter table public.store_suggestions add constraint store_suggestions_shape_check check (
  char_length(store_name) between 1 and 200
  and char_length(city) between 1 and 100
  and (neighborhood is null or char_length(neighborhood) <= 100)
  and (instagram is null or char_length(instagram) <= 200)
  and (website is null or char_length(website) <= 500)
  and (notes is null or char_length(notes) <= 2000)
) not valid;

drop index if exists public.stores_normalized_name_trgm_idx;
alter table public.stores drop column if exists normalized_name;

drop index if exists public.store_suggestions_normalized_name_trgm_idx;
alter table public.store_suggestions drop column if exists normalized_name;

alter table public.store_suggestions drop constraint if exists store_suggestions_status_check;
alter table public.store_suggestions drop column if exists status;

alter table public.store_suggestions
  drop column if exists submitter_name,
  drop column if exists submitter_email,
  drop column if exists country,
  drop column if exists address,
  drop column if exists reason;

drop function if exists public.immutable_unaccent(text);

commit;
