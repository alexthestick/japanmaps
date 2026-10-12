# Kurb cache batch rollout (proposal; do not run until approved)

The function is scheduler-only: it requires `x-cron-secret` to equal the Edge
Function environment secret `CRON_SECRET`. The secret value must never be added
to Git, pasted into a ticket, or printed in logs. The existing cron job is
`cache-kurb-inventory-hourly` (job ID 1), currently scheduled at `0 * * * *`.
Confirm those identifiers before editing production.

## A. Migration and secrets

1. Apply only `supabase/migrations/20261012031802_kurb_cache_state.sql` to the
   intended project. Do not blindly apply every pending repository migration.
2. Read-only check: `select singleton, last_store_id, lease_token,
   lease_expires_at from public.kurb_cache_state;` Expect exactly one row,
   `singleton = true`, with the other three fields null.
3. Generate a long random value in a password manager. Add it to Supabase Vault
   under the name `kurb_cache_cron_secret`, and add the *same* value in Edge
   Functions > Secrets as `CRON_SECRET`. Do not display or share the value.

Rollback A: While the old function is live, the table and secrets are inert.
Leave the table in place rather than dropping it during an incident. Remove the
secrets only after confirming no deployed function depends on them.

## B. Keep the job hourly, then deploy the function

Wait until the preceding hourly run has finished. First change only the cron
command below; the old function ignores the extra header. Then deploy the
reviewed function from a clean checkout of the merged commit with JWT gateway
verification *off* (`--no-verify-jwt`): the function itself performs the secret
check. Keep the schedule `0 * * * *` at this checkpoint.

```sql
select cron.alter_job(
  job_id := 1,
  schedule := '0 * * * *',
  command := $job$
    select net.http_post(
      url := 'https://avhtmmmblkjvinhhddzq.supabase.co/functions/v1/cache-kurb-inventory',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'kurb_cache_cron_secret'
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
  $job$
);
```

Check that a request without the header returns HTTP 401 and produces no Kurb
or database work. Do not show the request header value in any diagnostic output.

Rollback B: If the new function fails, do not leave the old cron command calling
it without a header. The safest containment is to pause job 1 and investigate
while retaining the existing cache. An emergency re-deploy of the recorded v10
source restores the former hourly behavior but also restores its unauthenticated
endpoint and timeout risk; obtain explicit approval before that downgrade.

## C. One authorized manual run

Wait at least a minute after the old hourly Kurb run completes to avoid an
overlapping Kurb rate window. Invoke one run with the same Vault-backed request
as above (only the inner `select net.http_post(...)` statement). `pg_net` queues
the request; its returned request ID is not proof of success. Check the Edge
Function response/logs: around 19 attempted, 0 unexpected errors, and no 401.
Read `kurb_cache_state` to confirm `last_store_id` advanced and both lease
fields returned to null. Check `kurb_items.fetched_at` for refreshed stores and
`get-kurb-inventory` still returning cached inventory. Stores with zero Kurb
items cannot be assessed via `fetched_at`; use the per-store run logs for them.

Before the manual run, test the quoted timestamp filter *read-only* against the
real database after migration: use the service-role client to `select` from
`kurb_cache_state` with `.or('lease_expires_at.is.null,lease_expires_at.lt."<ISO UTC timestamp>"')`.
Confirm no PostgREST parse error and that the unlocked row is returned. The
authorized manual run then exercises the actual conditional `UPDATE` and
release. Never run this test before the migration or with a public client.

Rollback C: If the manual run fails, do not change cadence. Leave the job
hourly, inspect the lease and logs, and avoid repeating the run blindly. A
stuck lease normally expires after 12 minutes. Do not clear it manually without
first verifying no run remains active.

## D. Switch cadence only after C passes

```sql
select cron.alter_job(job_id := 1, schedule := '*/15 * * * *');
```

With 75 stores and 19 per batch, four runs cover one cycle. Check four
consecutive runs for 19/19/19/18 attempts, cursor wrap, error count, and item
freshness. Retain the 1.2-second pacing and the 10-second per-request timeout.

Rollback D: Change only the schedule back to `0 * * * *` to stop the extra
invocations while diagnosing. Note that hourly *batch* runs refresh a full
75-store cycle every four hours, not every hour. Restore hourly full-refresh
semantics only with a separate, explicitly approved function rollback.
