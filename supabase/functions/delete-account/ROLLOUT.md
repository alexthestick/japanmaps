# delete-account completeness rollout

This PR does not deploy code or apply SQL. It adds ImageKit Finds-photo cleanup
and proposes changing the blocking `stores.submitted_by` foreign key to
`ON DELETE SET NULL`. The function's signed-in-user gate is unchanged and
`verify_jwt` must remain off at the gateway.

## Before deployment (separate approval required)

1. Review and apply **only**
   `20261020183155_stores_submitted_by_set_null.sql` directly to the intended
   project after explicit approval. Do not run `supabase db push`; repository
   and production migration histories are not synchronized. Verify the FK is
   `ON DELETE SET NULL`, `submitted_by` remains nullable, and store rows/count
   are unchanged. Record the applied version and align the filename if needed.
2. Set the Edge Function secret `IMAGEKIT_PRIVATE_KEY` through Supabase secret
   configuration (not chat or git). Prefer a dedicated restricted ImageKit key
   with Media Library read/write permission. The function requires it only when
   that account has ImageKit Finds photos; missing access fails closed. For the
   later approved rollout, use a hidden Terminal prompt and a shell variable,
   then `supabase secrets set` with `--project-ref`; do not paste the key into
   a command, chat, file, or log. Clear the variable afterward and verify only
   the secret **name** with `supabase secrets list`. This secret is project-wide,
   so use a restricted ImageKit key where possible. Do not perform this step
   as part of this PR.
3. From a clean checkout of the merged commit, deploy **only** `delete-account`
   with gateway JWT verification **off**. Confirm deployed source and version.

## Non-destructive checks

- A request with no bearer token returns 401.
- An invalid bearer token returns 401.
- Neither request lists/removes files or calls Auth admin deletion.
- Check logs show counts only, with no paths, URLs, file IDs, user IDs, emails,
  tokens, or raw provider error bodies.

Do not send a valid deletion request for an existing account. A complete live
test requires an explicitly approved throwaway account with a Finds photo in
ImageKit, files in the Storage buckets, and a submitted store. Check that its
files are removed and the store remains with `submitted_by = null`; also check
that another user's photo/store remains untouched. Historical Finds photos are
stored in the shared `/field-notes` ImageKit folder; newer uploads are under
`/stores/<user-id>`. The cleanup only targets exact URLs in that user's
`field_notes`. It keeps files also referenced by other users' notes or store
photos, and counts them as shared skips. A URL with no matching ImageKit file
counts as already deleted and is skipped. ImageKit API errors or a missing key
still fail closed. Logs contain counts, never paths or URLs.

## Failure and rollback

An ImageKit or Storage failure stops before Auth deletion and returns a
retryable error. ImageKit, Storage and Auth are separate services, so this
cannot be fully atomic: files successfully removed before a later failure
stay removed, while the account remains. Retrying should finish cleanup;
already-removed ImageKit assets are skipped.

If the new function fails in production, pause account deletion and diagnose
counts-only logs. Do not revert to a version that leaves ImageKit Finds photos
behind as a routine rollback. A fail-closed version returning a temporary
error is the safer emergency rollback. The FK change can be rolled back by
restoring its prior `NO ACTION` rule, but only after reviewing any deletions
that happened while `SET NULL` was active; never restore user attribution.
