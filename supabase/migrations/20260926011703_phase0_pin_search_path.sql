-- Follow-up to phase0_fix_store_suggestions_v3: the Supabase security
-- advisor flagged immutable_unaccent() for a mutable search_path right
-- after it was created. Pinning it closes that warning, matching the
-- pattern already used by is_user_admin().

alter function public.immutable_unaccent(text) set search_path = 'public', 'pg_temp';
