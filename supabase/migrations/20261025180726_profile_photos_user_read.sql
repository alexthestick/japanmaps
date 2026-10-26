-- Already applied to production as migration 20261025180726.
-- Permit an authenticated user to read only their own profile photo objects,
-- including the current {user_id}.jpg path and older {user_id}/... paths.
CREATE POLICY profile_photos_user_read
ON storage.objects
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (
    auth.uid()::text = split_part(name, '.', 1)
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);
