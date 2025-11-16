-- Add is_admin column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for fast admin checks
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin);

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies to protect admin-only operations
-- Only admins can insert stores
DROP POLICY IF EXISTS "Admins can insert stores" ON stores;
CREATE POLICY "Admins can insert stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (is_user_admin());

-- Only admins can update stores
DROP POLICY IF EXISTS "Admins can update stores" ON stores;
CREATE POLICY "Admins can update stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (is_user_admin());

-- Only admins can delete stores
DROP POLICY IF EXISTS "Admins can delete stores" ON stores;
CREATE POLICY "Admins can delete stores"
  ON stores FOR DELETE
  TO authenticated
  USING (is_user_admin());

-- Only admins can manage store suggestions
DROP POLICY IF EXISTS "Admins can update store suggestions" ON store_suggestions;
CREATE POLICY "Admins can update store suggestions"
  ON store_suggestions FOR UPDATE
  TO authenticated
  USING (is_user_admin());

-- Only admins can manage blog posts
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (is_user_admin());

DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (is_user_admin());

DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (is_user_admin());

-- IMPORTANT: After running this migration, you need to manually set your admin user
-- Run this query in Supabase SQL Editor, replacing the email with your actual admin email:
--
-- UPDATE profiles
-- SET is_admin = TRUE
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');
--
-- Or if the profile doesn't exist yet, insert it:
--
-- INSERT INTO profiles (id, is_admin)
-- VALUES ((SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'), TRUE)
-- ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;
