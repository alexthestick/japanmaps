-- Owner-submitted Finds are reviewed until the owner has an approved Find.
-- Admin moderation and service-role writes retain their requested status.
CREATE OR REPLACE FUNCTION public.set_field_note_status_for_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- A missing auth.uid() is not proof of service-role access: anon also has no UID.
  IF auth.role() = 'service_role' OR EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid() AND p.is_admin = true
  ) THEN
    RETURN NEW;
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

REVOKE ALL ON FUNCTION public.set_field_note_status_for_owner() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER field_notes_owner_status
BEFORE INSERT OR UPDATE ON public.field_notes
FOR EACH ROW EXECUTE FUNCTION public.set_field_note_status_for_owner();

-- WITH CHECK evaluates after BEFORE triggers. Keep the owner and admin rules
-- otherwise unchanged; owners may now insert/update the status set above.
ALTER POLICY field_notes_insert_own ON public.field_notes
  WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'approved'));

ALTER POLICY field_notes_update_own ON public.field_notes
  WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'approved'));
