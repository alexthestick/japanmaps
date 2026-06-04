-- Add slug column to get_stores_with_coordinates RPC
-- This eliminates the client-side generateSlug() fallback that runs on every
-- map load for every store. The slug column has a unique index (stores_slug_idx)
-- and is populated for all stores added since March 2026.
--
-- HOW TO APPLY:
--   Paste this into the Supabase SQL Editor and run it.
--   No data is changed — this only updates the function definition.

DROP FUNCTION IF EXISTS get_stores_with_coordinates();

CREATE OR REPLACE FUNCTION get_stores_with_coordinates()
RETURNS TABLE (
  id uuid,
  slug text,
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
    s.slug,
    s.name,
    s.address,
    s.city,
    s.neighborhood,
    s.country,
    ST_Y(s.location::geometry) AS latitude,
    ST_X(s.location::geometry) AS longitude,
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
