-- Add neighborhood column if it doesn't exist
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Update existing stores with their neighborhoods
UPDATE stores SET neighborhood = 'Harajuku' WHERE name = 'RAGTAG Harajuku';
UPDATE stores SET neighborhood = 'Harajuku' WHERE name = 'Chicago Harajuku';
UPDATE stores SET neighborhood = 'Shibuya' WHERE name = 'RINKAN Shibuya';
UPDATE stores SET neighborhood = 'Shimokitazawa' WHERE name = '2nd Street Shimokitazawa';
UPDATE stores SET neighborhood = 'Shinsaibashi' WHERE name = 'KINDAL Osaka';

-- Verify the updates
SELECT name, city, neighborhood FROM stores ORDER BY city, neighborhood;

