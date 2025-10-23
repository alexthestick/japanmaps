-- Fix category casing and remove duplicates
-- This fixes categories stored as lowercase to match the constants (Capitalized)

-- Fashion categories mapping
UPDATE stores
SET categories = (
  SELECT array_agg(DISTINCT 
    CASE 
      WHEN lower(cat) = 'archive' THEN 'archive'
      WHEN lower(cat) = 'vintage' THEN 'vintage'
      WHEN lower(cat) = 'secondhand' THEN 'secondhand'
      WHEN lower(cat) = 'streetwear' THEN 'streetwear'
      WHEN lower(cat) = 'designer' THEN 'designer'
      WHEN lower(cat) = 'luxury' THEN 'luxury'
      WHEN lower(cat) = 'avant-garde' THEN 'avant-garde'
      WHEN lower(cat) = 'military' THEN 'military'
      WHEN lower(cat) = 'antiques' THEN 'antiques'
      WHEN lower(cat) = 'stationery' THEN 'stationery'
      WHEN lower(cat) = 'flagship' THEN 'flagship'
      WHEN lower(cat) = 'concept store' THEN 'concept store'
      -- Food categories
      WHEN lower(cat) = 'ramen' THEN 'Ramen'
      WHEN lower(cat) = 'sushi' THEN 'Sushi'
      WHEN lower(cat) = 'izakaya' THEN 'Izakaya'
      WHEN lower(cat) = 'kaiseki' THEN 'Kaiseki'
      WHEN lower(cat) = 'yakitori' THEN 'Yakitori'
      WHEN lower(cat) = 'tempura' THEN 'Tempura'
      WHEN lower(cat) IN ('udon/soba', 'udon', 'soba') THEN 'Udon/Soba'
      WHEN lower(cat) = 'tonkatsu' THEN 'Tonkatsu'
      WHEN lower(cat) = 'yakiniku' THEN 'Yakiniku'
      WHEN lower(cat) IN ('cafe/restaurant', 'cafe', 'restaurant') THEN 'Cafe/Restaurant'
      WHEN lower(cat) = 'bakery' THEN 'Bakery'
      WHEN lower(cat) = 'dessert' THEN 'Dessert'
      WHEN lower(cat) IN ('street food', 'streetfood') THEN 'Street Food'
      WHEN lower(cat) IN ('fine dining', 'finedining') THEN 'Fine Dining'
      WHEN lower(cat) = 'pizza' THEN 'Pizza'
      WHEN lower(cat) = 'burger' THEN 'Burger'
      WHEN lower(cat) = 'curry' THEN 'Curry'
      WHEN lower(cat) = 'okonomiyaki' THEN 'Okonomiyaki'
      WHEN lower(cat) = 'bar' THEN 'Bar'
      WHEN lower(cat) = 'japanese' THEN 'Japanese'
      WHEN lower(cat) = 'western' THEN 'Western'
      WHEN lower(cat) = 'asian' THEN 'Asian'
      -- Keep as-is if no match
      ELSE cat
    END
  )
  FROM unnest(categories) AS cat
)
WHERE array_length(categories, 1) > 0;

-- Add comment
COMMENT ON COLUMN stores.categories IS 'Array of subcategories - Fashion uses lowercase, Food uses Capitalized';


