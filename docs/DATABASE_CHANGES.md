# Database changes

Do not run `supabase db push` on this project. The repository and production database migration histories are out of sync, so it could apply unrelated migrations.

For each approved database change, review the exact SQL, apply only that SQL directly to the intended Supabase project, and verify the schema and existing data afterward. Check the version Supabase records for the change, then rename the corresponding migration file to match that recorded version. Do not repair or replay unrelated migration history as part of a routine change.

## Proposed: trusted Finds auto-publish (not applied)

Do **not** apply this until separately approved. The current `field_notes.status` check constraint permits only `pending`, `approved`, and `rejected`; its default is `pending`. This migration adds the first trigger on `field_notes`, permits the trigger's approved status through the two owner `WITH CHECK` policies, and leaves admin moderation and the existing SELECT policies unchanged. The exact reviewed SQL is also saved in `supabase/migrations/20261022030610_trusted_finds_auto_publish.sql`:

```sql
CREATE OR REPLACE FUNCTION public.set_field_note_status_for_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid() AND p.is_admin = true
  ) THEN
    RETURN NEW;
  END IF;

  NEW.status := CASE WHEN EXISTS (
    SELECT 1 FROM public.field_notes AS f
    WHERE f.user_id = auth.uid() AND f.status = 'approved'
  ) THEN 'approved' ELSE 'pending' END;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_field_note_status_for_owner() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER field_notes_owner_status
BEFORE INSERT OR UPDATE ON public.field_notes
FOR EACH ROW EXECUTE FUNCTION public.set_field_note_status_for_owner();

ALTER POLICY field_notes_insert_own ON public.field_notes
  WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'approved'));

ALTER POLICY field_notes_update_own ON public.field_notes
  WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'approved'));
```

Before rollout, test in a non-production project with these accounts and compare database status to UI copy:

1. A new user submits their first Find: it is `pending`, and the form says “Sent for review.” A forged `status='approved'` from a new user is also `pending`.
2. An admin approves that Find: it becomes `approved`. The same user submits a second Find: it is `approved`, and the form says “Posted.”
3. The owner edits their first approved Find: it stays `approved`. A user with no approved Finds edits a rejected Find: it becomes `pending`. An admin can still reject an approved Find.
4. Anonymous requests cannot bypass status-setting or owner RLS. Verify that server-side service-role requests retain their explicit status, including with the project's current secret-key type.
5. Verify the public feed and store-specific feed show an approved submission immediately without a reload, while pending submissions remain out of both feeds.

The web change relies on the insert returning the final `status` via `INSERT ... RETURNING`/`.select('status')`. Check the response under the existing owner SELECT policy before production rollout.
