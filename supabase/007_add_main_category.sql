-- Add main_category field to stores table
-- This allows stores to be categorized as Fashion, Food, or Coffee
-- Sub-categories (vintage, archive, etc.) remain in the categories array

ALTER TABLE stores
ADD COLUMN main_category TEXT;

-- Add a check constraint to ensure valid main categories
ALTER TABLE stores
ADD CONSTRAINT main_category_check
CHECK (main_category IN ('Fashion', 'Food', 'Coffee'));

-- Set all existing stores to 'Fashion' as default
-- (You can update these individually later via admin panel)
UPDATE stores
SET main_category = 'Fashion'
WHERE main_category IS NULL;

-- Make main_category required for new stores
ALTER TABLE stores
ALTER COLUMN main_category SET NOT NULL;

-- Create index for faster filtering by main category
CREATE INDEX stores_main_category_idx ON stores(main_category);
