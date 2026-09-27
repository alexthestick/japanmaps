-- Backfilled into the repo on 2026-09-25 by Claude (see note in
-- 20260624002321_phase13c_store_suggestions_v2.sql). Recovered verbatim
-- from supabase_migrations.schema_migrations.
--
-- Stopgap only -- real fix is an Edge Function with per-IP throttling/captcha.

ALTER TABLE public.store_suggestions
  ADD CONSTRAINT store_suggestions_shape_check CHECK (
    char_length(store_name) BETWEEN 1 AND 200
    AND char_length(city) BETWEEN 1 AND 100
    AND (neighborhood IS NULL OR char_length(neighborhood) <= 100)
    AND (instagram IS NULL OR char_length(instagram) <= 200)
    AND (website IS NULL OR char_length(website) <= 500)
    AND (notes IS NULL OR char_length(notes) <= 2000)
  ) NOT VALID;
