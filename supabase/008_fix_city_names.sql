-- Fix city names based on address content
-- Many stores have neighborhood as city, but address contains the actual city

-- Update stores where address contains 'Tokyo' but city is not Tokyo
UPDATE stores
SET city = 'Tokyo'
WHERE address ILIKE '%Tokyo%'
  AND city != 'Tokyo';

-- Update stores where address contains 'Osaka' but city is not Osaka
UPDATE stores
SET city = 'Osaka'
WHERE address ILIKE '%Osaka%'
  AND city != 'Osaka';

-- Update stores where address contains 'Kyoto' but city is not Kyoto
UPDATE stores
SET city = 'Kyoto'
WHERE address ILIKE '%Kyoto%'
  AND city != 'Kyoto';

-- Update stores where address contains 'Nagoya' but city is not Nagoya
UPDATE stores
SET city = 'Nagoya'
WHERE address ILIKE '%Nagoya%'
  AND city != 'Nagoya';

-- Update stores where address contains 'Fukuoka' but city is not Fukuoka
UPDATE stores
SET city = 'Fukuoka'
WHERE address ILIKE '%Fukuoka%'
  AND city != 'Fukuoka';

-- Update stores where address contains 'Sapporo' but city is not Sapporo
UPDATE stores
SET city = 'Sapporo'
WHERE address ILIKE '%Sapporo%'
  AND city != 'Sapporo';

-- Update stores where address contains 'Yokohama' but city is not Yokohama
UPDATE stores
SET city = 'Yokohama'
WHERE address ILIKE '%Yokohama%'
  AND city != 'Yokohama';

-- View how many stores were updated
SELECT
  city,
  COUNT(*) as store_count
FROM stores
GROUP BY city
ORDER BY store_count DESC;
