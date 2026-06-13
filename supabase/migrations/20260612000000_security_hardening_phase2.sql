-- ─────────────────────────────────────────────────────────────
-- Security Hardening Phase 2
-- Date: 2026-06-12
-- Covers the remaining items from SESSION_HANDOFF.md
-- "Still needs fixing" section.
--
-- Items addressed:
--   1. Remove broad SELECT (list-all-files) policy on field-notes storage bucket
--   2. Add missing indexes: saved_stores(store_id), stores(submitted_by)
--   3. Fix auth.uid() initplan anti-pattern in RLS policies
--      (wrapping with SELECT so the function is called once per query, not per row)
--
-- Items NOT in this file (handled elsewhere):
--   - Rate-limit store_suggestions INSERT → Edge Function (rate-limit-suggestions)
--   - Leaked-password protection → Supabase Auth dashboard (one-click, no SQL)
-- ─────────────────────────────────────────────────────────────

-- ── 1. field-notes storage bucket ────────────────────────────
-- Drops the "Allow public read" SELECT policy on the field-notes bucket.
-- This policy lets anyone list ALL files in the bucket (like s3:ListBucket).
-- Public URLs for individual files still work without it — only bulk listing
-- is blocked. Confirmed policy name from Supabase dashboard: "Allow public read".
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;


-- ── 2. Missing indexes ────────────────────────────────────────
-- saved_stores.store_id — queried in "who saved this store?" lookups
CREATE INDEX IF NOT EXISTS saved_stores_store_id_idx
  ON public.saved_stores (store_id);

-- stores.submitted_by — queried when showing a user's submissions
CREATE INDEX IF NOT EXISTS stores_submitted_by_idx
  ON public.stores (submitted_by);


-- ── 3. auth.uid() initplan fix ────────────────────────────────
-- Policies that call auth.uid() (or auth.role()) bare re-evaluate the function
-- once per row.  Wrapping it in (SELECT auth.uid()) makes PostgreSQL treat it
-- as a stable initplan — evaluated once per query.  This matters at scale.
--
-- Recreate the most-queried policies with the fix.
-- (saved_stores, field_notes, gps_checkins — the tables with per-user SELECTs)

-- saved_stores
DROP POLICY IF EXISTS "saved_stores_select_own" ON public.saved_stores;
CREATE POLICY "saved_stores_select_own"
  ON public.saved_stores FOR SELECT
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "saved_stores_insert_own" ON public.saved_stores;
CREATE POLICY "saved_stores_insert_own"
  ON public.saved_stores FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "saved_stores_delete_own" ON public.saved_stores;
CREATE POLICY "saved_stores_delete_own"
  ON public.saved_stores FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- field_notes
DROP POLICY IF EXISTS "field_notes_select_own" ON public.field_notes;
CREATE POLICY "field_notes_select_own"
  ON public.field_notes FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR status = 'approved');

DROP POLICY IF EXISTS "field_notes_insert_own" ON public.field_notes;
CREATE POLICY "field_notes_insert_own"
  ON public.field_notes FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "field_notes_update_own" ON public.field_notes;
CREATE POLICY "field_notes_update_own"
  ON public.field_notes FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "field_notes_delete_own" ON public.field_notes;
CREATE POLICY "field_notes_delete_own"
  ON public.field_notes FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- gps_checkins (select + delete only — INSERT goes through the Edge Function)
DROP POLICY IF EXISTS "gps_checkins_select_own" ON public.gps_checkins;
CREATE POLICY "gps_checkins_select_own"
  ON public.gps_checkins FOR SELECT
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "gps_checkins_delete_own" ON public.gps_checkins;
CREATE POLICY "gps_checkins_delete_own"
  ON public.gps_checkins FOR DELETE
  USING (user_id = (SELECT auth.uid()));
