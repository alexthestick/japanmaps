-- Review-only until separately approved. The current foreign key defaults to
-- NO ACTION, so an authored store can prevent a profile/auth account delete.
-- Keep the store, but clear attribution when its submitter is deleted.
begin;

alter table public.stores
  drop constraint stores_submitted_by_fkey,
  add constraint stores_submitted_by_fkey
    foreign key (submitted_by) references public.profiles(id)
    on delete set null;

commit;
