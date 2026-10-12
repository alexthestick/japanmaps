-- Singleton cursor and lease for the batch-based Kurb cache refresh.
-- The initial row is required: a missing row is an error, not a busy lease.
create table public.kurb_cache_state (
  singleton boolean primary key default true check (singleton),
  last_store_id uuid,
  lease_token uuid,
  lease_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.kurb_cache_state enable row level security;
revoke all on public.kurb_cache_state from public, anon, authenticated;
grant select, update on public.kurb_cache_state to service_role;

insert into public.kurb_cache_state (singleton) values (true);
