-- Clean up duplicate photos in stores table
-- This removes duplicate URLs from the photos array

UPDATE stores
SET photos = (
  SELECT array_agg(DISTINCT photo ORDER BY photo)
  FROM unnest(photos) AS photo
)
WHERE array_length(photos, 1) > 0;

-- Add a comment
COMMENT ON COLUMN stores.photos IS 'Array of unique photo URLs for the store';

