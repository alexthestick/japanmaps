-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 4 Migration: Finds Comments
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- ─────────────────────────────────────────────────────────────────────────────

-- Create find_comments table
CREATE TABLE IF NOT EXISTS find_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  find_id     uuid REFERENCES field_notes(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body        text NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 500),
  created_at  timestamptz DEFAULT now()
);

-- Index for fast lookup by find
CREATE INDEX IF NOT EXISTS find_comments_find_id_idx ON find_comments(find_id);
CREATE INDEX IF NOT EXISTS find_comments_user_id_idx ON find_comments(user_id);

-- Enable Row Level Security
ALTER TABLE find_comments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read comments on approved finds
CREATE POLICY "Anyone can read comments"
  ON find_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM field_notes
      WHERE id = find_comments.find_id
        AND status = 'approved'
    )
  );

-- Authenticated users can insert their own comments
CREATE POLICY "Authenticated users can comment"
  ON find_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON find_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON find_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND is_admin = true
    )
  );
