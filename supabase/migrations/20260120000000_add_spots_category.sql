-- Add Spots to main_category check constraint

ALTER TABLE public.stores
DROP CONSTRAINT IF EXISTS main_category_check;

ALTER TABLE public.stores
ADD CONSTRAINT main_category_check
CHECK (main_category IN ('Fashion', 'Food', 'Coffee', 'Home Goods', 'Museum', 'Spots'));
