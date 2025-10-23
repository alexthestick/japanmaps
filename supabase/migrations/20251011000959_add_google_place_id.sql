-- Add google_place_id column to stores table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stores_google_place_id ON stores(google_place_id);

-- Add comment
COMMENT ON COLUMN stores.google_place_id IS 'Google Places API Place ID (ChIJ format) for fetching photos';
