# delete-account Storage cleanup rollout

This PR does not deploy code or apply SQL. The baseline commit is the exact
deployed version 11 source (`verify_jwt: false`). Its manual JWT check is
unchanged.

## Before deployment (separate approval required)

1. Review and apply only the SQL in
   `20261013181038_list_owned_account_storage_objects.sql` directly to the
   intended Supabase project. Do not run `supabase db push`; this repository's
   migration history is not synchronized with production. Record the applied
   version and align the filename afterward if Supabase records a different one.
2. Verify the lookup is callable by `service_role` and not by `anon` or
   `authenticated`. Verify it returns only `owner_id` matches in the four
   approved buckets. This lookup only reads object names; deletions use the
   Storage API.
3. From a clean checkout of the merged commit, deploy only `delete-account`
   with gateway JWT verification **off**, preserving version 11's manual
   `auth.getUser()` gate. Confirm the deployed source and version.

## Non-destructive checks

- A request with no bearer token returns 401.
- An invalid bearer token returns 401.
- Neither request lists/removes files or calls Auth admin deletion.
- Check logs show counts only, with no paths, user IDs, emails, tokens, or raw
  Storage errors.

Do not send a valid deletion request for an existing account. A complete live
test requires an explicitly approved throwaway account with files in each of
the four buckets and a separate account whose files must remain untouched.

## Failure and rollback

An object-listing or Storage-removal failure stops before Auth deletion and
returns a retryable error. Storage and Auth are separate services, so this
cannot be fully atomic: files successfully removed before a later failure
stay removed, while the account remains. Retrying should finish cleanup.

If the new function fails in production, pause account deletion and diagnose
the logs. Do not revert to version 11 as a routine rollback: it attempts Auth
deletion without clearing owned Storage objects. A fail-closed version that
returns a temporary error is the safer emergency rollback. Do not remove the
lookup SQL while the new function depends on it.
