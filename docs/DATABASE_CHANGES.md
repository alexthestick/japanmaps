# Database changes

Do not run `supabase db push` on this project. The repository and production database migration histories are out of sync, so it could apply unrelated migrations.

For each approved database change, review the exact SQL, apply only that SQL directly to the intended Supabase project, and verify the schema and existing data afterward. Check the version Supabase records for the change, then rename the corresponding migration file to match that recorded version. Do not repair or replay unrelated migration history as part of a routine change.

## Store chain brand in catalog RPC (applied 2026-10-28)

Supabase recorded `20261028070813_get_all_stores_json_chain_brand`. The live `public.get_all_stores_json()` definition adds `chain_brand` to each store object without changing its other fields. The matching SQL is in `supabase/migrations/20261028070813_get_all_stores_json_chain_brand.sql`. This is a record of an already-live change; do not re-apply it to production.

## Store chain brand column and index (applied 2026-10-28)

Supabase recorded `20261028030548_stores_chain_brand`. It adds nullable `public.stores.chain_brand` and a partial index on non-null values. The matching SQL is in `supabase/migrations/20261028030548_stores_chain_brand.sql`. A separate, already-completed one-time data fix tagged 176 chain branches; its backup is `backups.stores_chain_fix_20261027`. That data fix is not part of this migration file and must not be replayed. The schema change is already live; do not re-apply it to production.

## Find photo owner read policy (applied 2026-10-27)

Supabase recorded `20261027062631_finds_photos_user_read`. The policy is already live; do not re-apply it to production. It grants `SELECT` on `storage.objects` to `authenticated` only for objects in `finds-photos` whose first folder is the signed-in user's ID. This allows owner-scoped Storage removal to return the deleted object alongside the existing `DELETE` policy. The matching SQL is in `supabase/migrations/20261027062631_finds_photos_user_read.sql`.

## Profile photo owner read policy (applied 2026-10-25)

Supabase recorded `20261025180726_profile_photos_user_read`. The policy is already live; do not re-apply it to production. It grants `SELECT` on `storage.objects` to `authenticated` only for objects in `profile-photos` whose filename stem equals the signed-in user's ID (`{user_id}.jpg`) or whose first folder is that ID (older paths). This is needed for profile photo uploads with `upsert: true`, which require owner `SELECT` in addition to the existing write policies. The matching SQL is in `supabase/migrations/20261025180726_profile_photos_user_read.sql`.

## Approve admin-owned Finds on insert (applied 2026-10-23)

Supabase recorded this change as migration `20261023082848`. The previous trigger bypassed status-setting for admins on both INSERT and UPDATE, so an admin's own new Find could stay `pending`. This replacement sets admin INSERTs to `approved` while leaving admin moderation UPDATEs, non-admin trust and rejected-edit rules, and non-`authenticated` calls unchanged. It does not change existing pending Finds. The SQL is in `supabase/migrations/20261023082848_approve_admin_find_inserts.sql`:

```sql
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
```

For future regression checks, use rolled-back database cases for: an authenticated admin INSERT requesting `pending` (must become `approved`); admin moderation UPDATE to `rejected` (must stay `rejected`); new and trusted non-admin INSERTs (`pending` and `approved` respectively); trusted edit of a rejected Find (`pending`); and no-JWT and service-role UPDATEs (statuses unchanged). Confirm rollback leaves no function, trigger, policy or test-row changes.

## Trusted Finds auto-publish (applied 2026-10-22)

Applied to production after approval as Supabase migration `20261022181831`. The `field_notes.status` check constraint permits only `pending`, `approved`, and `rejected`; its default is `pending`. This migration adds the first trigger on `field_notes`, permits the trigger's approved status through the two owner `WITH CHECK` policies, and leaves admin moderation and the existing SELECT policies unchanged. The exact reviewed SQL is also saved in `supabase/migrations/20261022181831_trusted_finds_auto_publish.sql`:

```sql
CREATE OR REPLACE FUNCTION public.set_field_note_status_for_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid() AND p.is_admin = true
  ) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'rejected' THEN
      NEW.status := 'pending';
      RETURN NEW;
    END IF;
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

For future regression checks, use a non-production project with these accounts and compare database status to UI copy:

1. A new user submits their first Find: it is `pending`, and the form says “Sent for review.” A forged `status='approved'` from a new user is also `pending`.
2. An admin approves that Find: it becomes `approved`. The same user submits a second Find: it is `approved`, and the form says “Posted.”
3. The owner edits their first approved Find: it stays `approved`. A trusted owner (with another approved Find) edits a rejected Find: it becomes `pending`, never `approved`. An admin can still reject an approved Find.
4. Anonymous requests cannot bypass owner RLS. Verify that service-role writes retain their explicit status, including with the project's current secret-key type. As postgres/dashboard SQL (no JWT), delete a test store referenced by an approved Find: its `store_id` becomes `NULL` via `ON DELETE SET NULL`, while its status stays `approved`. Check the same role-less pass-through for a cron-style SQL update.
5. Verify the public feed and store-specific feed show an approved submission immediately without a reload, while pending submissions remain out of both feeds.

The web change relies on the insert returning the final `status` via `INSERT ... RETURNING`/`.select('status')`. Include the response under the existing owner SELECT policy in future regression checks.
