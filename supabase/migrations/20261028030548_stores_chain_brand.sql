-- Already applied to production as migration 20261028030548.
-- Recorded SQL from supabase_migrations.schema_migrations; do not re-apply.
alter table public.stores add column if not exists chain_brand text;
comment on column public.stores.chain_brand is 'Brand name shared by all branches of a chain (e.g. 2nd STREET). Null for independent stores.';
create index if not exists stores_chain_brand_idx on public.stores (chain_brand) where chain_brand is not null;
