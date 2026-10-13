-- Read-only ownership lookup for delete-account. File deletion itself must use
-- the Storage API; never DELETE from storage.objects directly.
-- Apply this reviewed SQL directly. Do not use supabase db push on this project.
create or replace function public.list_owned_account_storage_objects(
  p_user_id uuid,
  p_bucket_id text
)
returns table (object_name text)
language sql
stable
security invoker
set search_path = ''
as $$
  select objects.name as object_name
  from storage.objects as objects
  where objects.owner_id = p_user_id::text
    and objects.bucket_id = p_bucket_id
    and p_bucket_id in ('field-notes', 'profile-photos', 'stamp-photos', 'finds-photos')
  order by objects.name
  limit 100;
$$;

revoke all on function public.list_owned_account_storage_objects(uuid, text)
  from public, anon, authenticated;
grant execute on function public.list_owned_account_storage_objects(uuid, text)
  to service_role;
