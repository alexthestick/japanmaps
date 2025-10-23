-- Fix RPC function to include main_category field
-- This was causing Food/Coffee stores to not appear when filtered

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_stores_with_coordinates();

-- Recreate with main_category and google_place_id
CREATE OR REPLACE FUNCTION get_stores_with_coordinates()
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  city text,
  neighborhood text,
  country text,
  latitude double precision,
  longitude double precision,
  main_category text,
  categories text[],
  price_range text,
  description text,
  photos text[],
  website text,
  instagram text,
  hours text,
  verified boolean,
  submitted_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  haul_count integer,
  save_count integer,
  google_place_id text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.address,
    s.city,
    s.neighborhood,
    s.country,
    ST_Y(s.location::geometry) as latitude,
    ST_X(s.location::geometry) as longitude,
    s.main_category,
    s.categories,
    s.price_range,
    s.description,
    s.photos,
    s.website,
    s.instagram,
    s.hours,
    s.verified,
    s.submitted_by,
    s.created_at,
    s.updated_at,
    s.haul_count,
    s.save_count,
    s.google_place_id
  FROM stores s;
END;
$$ LANGUAGE plpgsql;

