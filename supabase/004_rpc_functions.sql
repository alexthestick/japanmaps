-- Create RPC function to get stores with proper coordinates
-- This function extracts latitude/longitude from PostGIS geography type
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
  save_count integer
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
    s.save_count
  FROM stores s;
END;
$$ LANGUAGE plpgsql;

