-- ============================================================
-- Phase 2 Migration: GPS Check-ins & Passport System
-- File: supabase/migrations/20260609000000_phase2_gps_checkins.sql
--
-- HOW TO APPLY:
--   Paste the entire file into the Supabase SQL Editor and run it.
--   Safe to re-run — all CREATE statements use IF NOT EXISTS /
--   OR REPLACE, and DROP ... IF EXISTS guards the RPCs.
-- ============================================================


-- ── 1. gps_checkins table ─────────────────────────────────────
--
-- GPS-verified Radar mode check-ins. Kept separate from
-- store_visits (the manual "I've been here" toggle) so the two
-- data streams stay clean and independently queryable.

CREATE TABLE IF NOT EXISTS gps_checkins (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid              NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  store_id        uuid              NOT NULL REFERENCES stores(id)       ON DELETE CASCADE,
  visited_at      timestamptz       NOT NULL DEFAULT now(),

  -- GPS coords at moment of check-in (submitted by client, verified server-side)
  latitude        double precision  NOT NULL,
  longitude       double precision  NOT NULL,
  accuracy_meters real,             -- metres, from GeolocationCoordinates.accuracy

  -- Denormalised for fast analytics without joins
  neighborhood    text,
  city            text,

  -- Quality flag:
  --   true  → accuracy_meters <= 25 at check-in time (high confidence)
  --   false → weak GPS; stamp is recorded but shown as unverified in passport
  -- Users can re-check-in later with good GPS to flip this to true.
  verified        boolean           NOT NULL DEFAULT false,

  -- One stamp per store per user (re-check-in updates, not duplicates)
  CONSTRAINT gps_checkins_user_store_unique UNIQUE (user_id, store_id)
);


-- ── 2. Indexes ────────────────────────────────────────────────

-- Passport grid: all stamps for a user
CREATE INDEX IF NOT EXISTS gps_checkins_user_idx
  ON gps_checkins (user_id);

-- Store page analytics: total stamps on a store
CREATE INDEX IF NOT EXISTS gps_checkins_store_idx
  ON gps_checkins (store_id);

-- Neighbourhood badge progress queries
CREATE INDEX IF NOT EXISTS gps_checkins_user_nbhd_idx
  ON gps_checkins (user_id, neighborhood);


-- ── 3. checkin_count column on stores ────────────────────────
-- Running counter so store pages never need a COUNT(*) query.
-- Maintained by the triggers below.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS checkin_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION _increment_store_checkin_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stores SET checkin_count = checkin_count + 1 WHERE id = NEW.store_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION _decrement_store_checkin_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stores
  SET checkin_count = GREATEST(0, checkin_count - 1)
  WHERE id = OLD.store_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp
SECURITY DEFINER;

-- Trigger fires on INSERT (new stamp) — not on UPDATE (re-verification)
DROP TRIGGER IF EXISTS gps_checkins_inc_count ON gps_checkins;
CREATE TRIGGER gps_checkins_inc_count
  AFTER INSERT ON gps_checkins
  FOR EACH ROW EXECUTE FUNCTION _increment_store_checkin_count();

-- Trigger fires on DELETE (user removes a stamp)
DROP TRIGGER IF EXISTS gps_checkins_dec_count ON gps_checkins;
CREATE TRIGGER gps_checkins_dec_count
  AFTER DELETE ON gps_checkins
  FOR EACH ROW EXECUTE FUNCTION _decrement_store_checkin_count();


-- ── 4. RLS policies ──────────────────────────────────────────
--
-- INSERT is handled exclusively by the Edge Function (service role),
-- which bypasses RLS entirely — that's the server-side verification
-- guarantee. No INSERT policy for the authenticated role is intentional.
--
-- Store-level aggregate counts come from stores.checkin_count, so anon
-- users never need direct access to this table.

ALTER TABLE gps_checkins ENABLE ROW LEVEL SECURITY;

-- Users can read their own stamps (passport, approach card re-verify check)
DROP POLICY IF EXISTS "gps_checkins_select_own"   ON gps_checkins;
CREATE POLICY "gps_checkins_select_own"
  ON gps_checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can remove their own stamps (un-stamp feature, build later if needed)
DROP POLICY IF EXISTS "gps_checkins_delete_own"   ON gps_checkins;
CREATE POLICY "gps_checkins_delete_own"
  ON gps_checkins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ── 5. RPC: get_my_checkins ───────────────────────────────────
-- All stamps for the currently authenticated user, with the store
-- details needed to render each passport card.
-- Called from: ProfilePage (Passport tab).

DROP FUNCTION IF EXISTS get_my_checkins();

CREATE OR REPLACE FUNCTION get_my_checkins()
RETURNS TABLE (
  checkin_id      uuid,
  store_id        uuid,
  store_name      text,
  store_slug      text,
  neighborhood    text,
  city            text,
  photo_url       text,
  visited_at      timestamptz,
  verified        boolean,
  accuracy_meters real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id                                          AS checkin_id,
    s.id                                          AS store_id,
    s.name                                        AS store_name,
    s.slug                                        AS store_slug,
    COALESCE(c.neighborhood, s.neighborhood)      AS neighborhood,
    COALESCE(c.city, s.city)                      AS city,
    s.photos[1]                                   AS photo_url,
    c.visited_at,
    c.verified,
    c.accuracy_meters
  FROM gps_checkins c
  JOIN stores s ON s.id = c.store_id
  WHERE c.user_id = auth.uid()
  ORDER BY c.visited_at DESC;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp
SECURITY DEFINER;


-- ── 6. RPC: get_my_checkin_status ────────────────────────────
-- Has the current user already stamped a specific store?
-- Returns whether it exists and whether it's verified.
-- Called from: Radar mode approach card (Stamp vs Verify CTA).

DROP FUNCTION IF EXISTS get_my_checkin_status(uuid);

CREATE OR REPLACE FUNCTION get_my_checkin_status(p_store_id uuid)
RETURNS TABLE (
  has_checkin boolean,
  verified    boolean,
  visited_at  timestamptz
) AS $$
DECLARE
  v_row gps_checkins%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM gps_checkins
  WHERE user_id = auth.uid() AND store_id = p_store_id
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT true, v_row.verified, v_row.visited_at;
  ELSE
    RETURN QUERY SELECT false, false, NULL::timestamptz;
  END IF;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp
SECURITY DEFINER;


-- ── 7. RPC: get_my_badge_progress ────────────────────────────
-- Check-in counts grouped by neighbourhood for the current user.
-- Client computes badge tier from count: 3 = bronze, 7 = silver, 15 = gold.
-- Also returns total stores per neighbourhood so the UI can show
-- e.g. "4 / 40 stores" as context.
-- Called from: ProfilePage (Passport tab, neighbourhood badges row).

DROP FUNCTION IF EXISTS get_my_badge_progress();

CREATE OR REPLACE FUNCTION get_my_badge_progress()
RETURNS TABLE (
  neighborhood        text,
  city                text,
  visited_count       bigint,
  total_store_count   bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH visited AS (
    SELECT
      COALESCE(c.neighborhood, s.neighborhood) AS nbhd,
      COALESCE(c.city, s.city)                 AS city,
      COUNT(*)                                  AS visited_count
    FROM gps_checkins c
    JOIN stores s ON s.id = c.store_id
    WHERE c.user_id = auth.uid()
      AND COALESCE(c.neighborhood, s.neighborhood) IS NOT NULL
    GROUP BY 1, 2
  ),
  totals AS (
    SELECT
      neighborhood AS nbhd,
      city,
      COUNT(*) AS total_count
    FROM stores
    WHERE neighborhood IS NOT NULL
    GROUP BY 1, 2
  )
  SELECT
    v.nbhd          AS neighborhood,
    v.city          AS city,
    v.visited_count AS visited_count,
    COALESCE(t.total_count, 0) AS total_store_count
  FROM visited v
  LEFT JOIN totals t ON t.nbhd = v.nbhd AND t.city = v.city
  ORDER BY v.visited_count DESC;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp
SECURITY DEFINER;


-- ── 8. Comments ───────────────────────────────────────────────

COMMENT ON TABLE  gps_checkins IS 'GPS-verified Radar mode check-ins. One row per (user, store). INSERT only via gps-checkin Edge Function (service role).';
COMMENT ON COLUMN gps_checkins.verified IS 'true when accuracy_meters <= 25 at check-in. Weak-GPS stamps are recorded but shown as unverified in the passport until the user re-checks-in with good signal.';
COMMENT ON COLUMN gps_checkins.accuracy_meters IS 'Raw GeolocationCoordinates.accuracy at the moment of check-in. Used to compute the dynamic check-in radius and to set the verified flag.';
COMMENT ON COLUMN stores.checkin_count IS 'Denormalised count of GPS check-ins. Maintained by gps_checkins_inc_count / gps_checkins_dec_count triggers. Never update manually.';
