-- Insert the "Best Archive Clothing Stores in Japan" blog post
-- This is a special editorial page with parallax effects

INSERT INTO blog_posts (
  title,
  slug,
  hero_image,
  content,
  category,
  referenced_stores,
  published_at
) VALUES (
  'Best Archive Clothing Stores in Japan',
  'best-archive-clothing-stores-in-japan',
  'https://avhtmmmblkjvinhhddzq.supabase.co/storage/v1/object/public/storage-photos/7bf4a15d-e71b-40df-8ca7-3d648262dd94-0-1760459074422.jpeg',
  'Japan truly has one of the most unique and passionate archive clothing scenes in the world — from Tokyo to Osaka, you''ll find rare pieces from coveted designers like Raf Simons, Undercover, Yohji Yamamoto, Issey Miyake and many more. Even beyond the designers we all love, there are stores curating other designers that you might not have known there was such deep passion for. Beyond the clothes it''s the experience — walking into one of these often-hidden stores feels like stepping into archive clothing heaven.',
  NULL,
  ARRAY[]::UUID[],
  NOW()
)
ON CONFLICT (slug) DO NOTHING;







