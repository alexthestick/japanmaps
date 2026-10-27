-- Already applied to production as migration 20261027062631.
-- Permit signed-in users to select only Find photos in their own folder.
CREATE POLICY finds_photos_user_read
ON storage.objects
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  bucket_id = 'finds-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
