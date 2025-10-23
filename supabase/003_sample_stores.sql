-- Insert sample stores for testing
-- Note: Replace the photo URLs with actual photos when you add real stores

INSERT INTO stores (
  name,
  address,
  city,
  neighborhood,
  country,
  location,
  categories,
  price_range,
  description,
  photos,
  instagram,
  verified
) VALUES
(
  'RAGTAG Harajuku',
  '6-14-2 Jingumae, Shibuya-ku',
  'Tokyo',
  'Harajuku',
  'Japan',
  ST_GeogFromText('POINT(139.7028 35.6694)'),
  ARRAY['archive', 'vintage'],
  '$$',
  'One of Tokyo''s best secondhand designer stores with an incredible selection of archive pieces. Multiple floors packed with rare finds from luxury brands.',
  ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
  'ragtag_official',
  true
),
(
  'RINKAN Shibuya',
  '31-2 Udagawacho, Shibuya-ku',
  'Tokyo',
  'Shibuya',
  'Japan',
  ST_GeogFromText('POINT(139.6973 35.6617)'),
  ARRAY['streetwear', 'vintage'],
  '$$',
  'Premium streetwear and vintage with a focus on rare finds. Known for Supreme, Bape, and archive Nike.',
  ARRAY['https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800'],
  'rinkan_official',
  true
),
(
  'KINDAL Osaka',
  '1-9-1 Minamisenba, Chuo-ku',
  'Osaka',
  'Shinsaibashi',
  'Japan',
  ST_GeogFromText('POINT(135.5008 34.6752)'),
  ARRAY['archive', 'designer'],
  '$$$',
  'High-end archive fashion in the heart of Osaka. Specializes in luxury designer pieces and rare collaborations.',
  ARRAY['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800'],
  'kindal_osaka',
  true
),
(
  'Chicago Harajuku',
  '6-31-21 Jingumae, Shibuya-ku',
  'Tokyo',
  'Harajuku',
  'Japan',
  ST_GeogFromText('POINT(139.7067 35.6707)'),
  ARRAY['vintage', 'secondhand'],
  '$',
  'Iconic vintage shop that''s been a Harajuku staple for decades. Great selection of American vintage clothing.',
  ARRAY['https://images.unsplash.com/photo-1558769132-cb1aea1847c8?w=800'],
  'chicago_harajuku',
  true
),
(
  '2nd Street Shimokitazawa',
  '2-25-8 Kitazawa, Setagaya-ku',
  'Tokyo',
  'Shimokitazawa',
  'Japan',
  ST_GeogFromText('POINT(139.6681 35.6617)'),
  ARRAY['vintage', 'secondhand', 'streetwear'],
  '$',
  'Popular secondhand chain with consistently good finds. This Shimokitazawa location is one of the best.',
  ARRAY['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800'],
  '2ndstreet_official',
  true
);

-- You can add more sample stores here or delete these and add your own!


