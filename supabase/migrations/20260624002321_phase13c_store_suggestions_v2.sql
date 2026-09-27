-- Backfilled into the repo on 2026-09-25 by Claude, after discovering this
-- migration was applied live on 2026-06-24 but never committed here. That
-- drift is what silently broke the public "suggest a store" form and the
-- admin dashboard (both expected a richer store_suggestions shape than the
-- live table had). Recovered verbatim from supabase_migrations.schema_migrations.

DROP TABLE IF EXISTS public.store_suggestions CASCADE;
CREATE TABLE public.store_suggestions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name   TEXT NOT NULL,
  city         TEXT NOT NULL,
  neighborhood TEXT,
  instagram    TEXT,
  website      TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed     BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE public.store_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suggestions_insert"
  ON public.store_suggestions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX suggestions_reviewed_idx ON public.store_suggestions (reviewed, created_at DESC);
