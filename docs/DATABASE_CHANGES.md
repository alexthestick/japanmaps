# Database changes

Do not run `supabase db push` on this project. The repository and production database migration histories are out of sync, so it could apply unrelated migrations.

For each approved database change, review the exact SQL, apply only that SQL directly to the intended Supabase project, and verify the schema and existing data afterward. Check the version Supabase records for the change, then rename the corresponding migration file to match that recorded version. Do not repair or replay unrelated migration history as part of a routine change.
