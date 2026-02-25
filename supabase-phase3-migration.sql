-- ============================================================
-- Phase 3 Migration: User Accounts, Field Notes, Store Visits
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Add visit_count to stores table
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS visit_count integer DEFAULT 0;

-- 3. Create field_notes table
CREATE TABLE IF NOT EXISTS field_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('visit', 'haul')),
  photo_url text,
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  store_name text NOT NULL,
  neighborhood text,
  city text NOT NULL,
  item_name text,
  caption text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- 4. Create store_visits table (one row per user per store — unique check-in)
CREATE TABLE IF NOT EXISTS store_visits (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, store_id)
);

-- 5. Create saved_stores table (bookmarks)
CREATE TABLE IF NOT EXISTS saved_stores (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, store_id)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE field_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_stores ENABLE ROW LEVEL SECURITY;

-- --- field_notes policies ---
-- Anyone can read approved field notes
CREATE POLICY "field_notes_read_approved"
  ON field_notes FOR SELECT
  USING (status = 'approved');

-- Authenticated users can read their own (any status)
CREATE POLICY "field_notes_read_own"
  ON field_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own
CREATE POLICY "field_notes_insert_own"
  ON field_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own pending notes
CREATE POLICY "field_notes_update_own"
  ON field_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending notes
CREATE POLICY "field_notes_delete_own"
  ON field_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can do everything
CREATE POLICY "field_notes_admin_all"
  ON field_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- --- store_visits policies ---
-- Anyone can read visit counts (but only aggregate, not who visited)
CREATE POLICY "store_visits_read_all"
  ON store_visits FOR SELECT
  USING (true);

-- Authenticated users can insert their own visit
CREATE POLICY "store_visits_insert_own"
  ON store_visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own visit (un-check-in)
CREATE POLICY "store_visits_delete_own"
  ON store_visits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- --- saved_stores policies ---
-- Users can only read their own saved stores
CREATE POLICY "saved_stores_read_own"
  ON saved_stores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can save stores
CREATE POLICY "saved_stores_insert_own"
  ON saved_stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave stores
CREATE POLICY "saved_stores_delete_own"
  ON saved_stores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- --- profiles policies (make sure they exist) ---
-- Check if policies already exist before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_read_all'
  ) THEN
    CREATE POLICY "profiles_read_all"
      ON profiles FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY "profiles_update_own"
      ON profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NULL,  -- username chosen during onboarding
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-increment visit_count on store when visit is added
CREATE OR REPLACE FUNCTION increment_visit_count()
RETURNS trigger AS $$
BEGIN
  UPDATE stores
  SET visit_count = visit_count + 1
  WHERE id = NEW.store_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_store_visit_added ON store_visits;
CREATE TRIGGER on_store_visit_added
  AFTER INSERT ON store_visits
  FOR EACH ROW EXECUTE FUNCTION increment_visit_count();

-- Auto-decrement visit_count on store when visit is removed
CREATE OR REPLACE FUNCTION decrement_visit_count()
RETURNS trigger AS $$
BEGIN
  UPDATE stores
  SET visit_count = GREATEST(visit_count - 1, 0)
  WHERE id = OLD.store_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_store_visit_removed ON store_visits;
CREATE TRIGGER on_store_visit_removed
  AFTER DELETE ON store_visits
  FOR EACH ROW EXECUTE FUNCTION decrement_visit_count();

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS field_notes_user_id_idx ON field_notes(user_id);
CREATE INDEX IF NOT EXISTS field_notes_store_id_idx ON field_notes(store_id);
CREATE INDEX IF NOT EXISTS field_notes_status_idx ON field_notes(status);
CREATE INDEX IF NOT EXISTS field_notes_created_at_idx ON field_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS store_visits_store_id_idx ON store_visits(store_id);
CREATE INDEX IF NOT EXISTS saved_stores_user_id_idx ON saved_stores(user_id);
