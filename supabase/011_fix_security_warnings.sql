-- Fix Supabase Security Warnings
-- Migration: 011_fix_security_warnings.sql

-- 1. Fix search_path for update_updated_at_column function
-- This prevents SQL injection attacks by setting a stable search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp
SECURITY DEFINER;

-- 2. Fix search_path for is_user_admin function
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp
SECURITY DEFINER;

-- 3. Fix search_path for get_stores_with_coordinates function
CREATE OR REPLACE FUNCTION get_stores_with_coordinates()
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  city TEXT,
  neighborhood TEXT,
  address TEXT,
  google_maps_url TEXT,
  coordinates GEOMETRY(Point, 4326),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.category,
    s.city,
    s.neighborhood,
    s.address,
    s.google_maps_url,
    s.coordinates,
    ST_Y(s.coordinates::geometry) as lat,
    ST_X(s.coordinates::geometry) as lng
  FROM stores s
  WHERE s.coordinates IS NOT NULL;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp
SECURITY DEFINER;

-- 4. Note about spatial_ref_sys table:
-- The spatial_ref_sys table is a PostGIS system table that stores coordinate system information.
-- It's managed by PostGIS and doesn't contain user data, so RLS is not typically needed.
-- However, if you want to enable RLS on it (not recommended), you can run:
-- ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON spatial_ref_sys FOR SELECT USING (true);

-- 5. Note about postgis extension schema:
-- Moving the postgis extension from public to another schema requires recreation.
-- This is a complex operation and should only be done if absolutely necessary.
-- If you need to do this, you would:
-- CREATE SCHEMA IF NOT EXISTS extensions;
-- DROP EXTENSION IF EXISTS postgis CASCADE;
-- CREATE EXTENSION postgis SCHEMA extensions;
-- However, this will require updating all geometry column references throughout your database.

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to update updated_at timestamp. search_path set for security.';
COMMENT ON FUNCTION is_user_admin() IS 'Check if current user is an admin. search_path set for security.';
COMMENT ON FUNCTION get_stores_with_coordinates() IS 'Get all stores with valid coordinates. search_path set for security.';
