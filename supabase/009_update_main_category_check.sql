-- Update main_category check constraint to include new categories

ALTER TABLE stores
DROP CONSTRAINT IF EXISTS main_category_check;

ALTER TABLE stores
ADD CONSTRAINT main_category_check
CHECK (main_category IN ('Fashion', 'Food', 'Coffee', 'Home Goods', 'Museum'));



