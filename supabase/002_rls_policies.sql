-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Stores policies
CREATE POLICY "Stores are viewable by everyone"
  ON stores FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert stores"
  ON stores FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only store creator can update"
  ON stores FOR UPDATE
  USING (auth.uid() = submitted_by);

-- Store suggestions policies
CREATE POLICY "Anyone can insert store suggestions"
  ON store_suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view suggestions"
  ON store_suggestions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update suggestions"
  ON store_suggestions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Saved stores policies
CREATE POLICY "Users can view own saved stores"
  ON saved_stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved stores"
  ON saved_stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved stores"
  ON saved_stores FOR DELETE
  USING (auth.uid() = user_id);

-- Blog posts policies
CREATE POLICY "Blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can manage blog posts"
  ON blog_posts FOR ALL
  USING (auth.role() = 'authenticated');


