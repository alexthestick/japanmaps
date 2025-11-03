-- Add support for parallax article format to blog_posts table

-- Add article_type column with enum
DO $$ BEGIN
  CREATE TYPE article_type AS ENUM ('standard', 'parallax_store_guide');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS article_type article_type DEFAULT 'parallax_store_guide';

-- Add sections_data column for parallax article sections
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS sections_data JSONB;

-- Add intro_content column for text before parallax sections
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS intro_content TEXT;

-- Update existing "Best Archive Clothing Stores in Japan" to parallax type
UPDATE blog_posts
SET article_type = 'parallax_store_guide'
WHERE slug = 'best-archive-clothing-stores-in-japan';

-- Add comment to clarify the JSON structure
COMMENT ON COLUMN blog_posts.sections_data IS
'Array of store sections for parallax articles. Structure: [{store_name, description, image, address, map_link, reverse}]';
