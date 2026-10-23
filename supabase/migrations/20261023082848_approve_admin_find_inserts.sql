-- Approve an admin's own new Find without changing admin moderation updates.
-- All non-admin and non-authenticated paths remain as in migration 20261022181831.
CREATE OR REPLACE FUNCTION public.set_field_note_status_for_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Database-side updates (including ON DELETE SET NULL), service-role writes,
  -- and anonymous requests must not change the status supplied by their caller.
  IF auth.role() IS DISTINCT FROM 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid() AND p.is_admin = true
  ) THEN
    -- Admin moderation updates retain the status the admin selected.
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'approved';
    END IF;
    RETURN NEW;
  END IF;

  -- An owner editing a rejected Find sends it back to review, even if another
  -- Find has since made that owner trusted.
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'rejected' THEN
      NEW.status := 'pending';
      RETURN NEW;
    END IF;
  END IF;

  -- On UPDATE the existing approved row is intentionally included: editing a
  -- user's first approved Find must not send it back to the review queue.
  NEW.status := CASE WHEN EXISTS (
    SELECT 1
    FROM public.field_notes AS f
    WHERE f.user_id = auth.uid() AND f.status = 'approved'
  ) THEN 'approved' ELSE 'pending' END;
  RETURN NEW;
END;
$$;
