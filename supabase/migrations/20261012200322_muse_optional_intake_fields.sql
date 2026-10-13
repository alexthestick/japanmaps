-- Optional provenance and merchandising details supplied by Muse.
-- website already exists on store_suggestions; keep it nullable and make
-- this migration safe for a fresh schema as well as the current live one.
-- No existing suggestion rows are changed.
alter table public.store_suggestions
  add column if not exists website text,
  add column if not exists instagram_bio text,
  add column if not exists brands_carried text[],
  add column if not exists price_range text,
  add column if not exists opening_date date,
  add column if not exists verification_evidence text,
  add column if not exists source_type text,
  add column if not exists source_account text,
  add column if not exists discovered_via text;
