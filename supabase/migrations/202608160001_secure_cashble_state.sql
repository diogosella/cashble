create table if not exists public.cashble_state (
  id text primary key,
  data jsonb not null
);

alter table public.cashble_state
drop constraint if exists cashble_state_single_row;

alter table public.cashble_state enable row level security;

revoke all on table public.cashble_state from anon;
grant select, insert, update, delete on table public.cashble_state to authenticated;

drop policy if exists "Users can read their own state" on public.cashble_state;
drop policy if exists "Users can create their own state" on public.cashble_state;
drop policy if exists "Users can update their own state" on public.cashble_state;
drop policy if exists "Users can delete their own state" on public.cashble_state;

create policy "Users can read their own state"
on public.cashble_state
for select
to authenticated
using ((select auth.uid())::text = id);

create policy "Users can create their own state"
on public.cashble_state
for insert
to authenticated
with check ((select auth.uid())::text = id);

create policy "Users can update their own state"
on public.cashble_state
for update
to authenticated
using ((select auth.uid())::text = id)
with check ((select auth.uid())::text = id);

create policy "Users can delete their own state"
on public.cashble_state
for delete
to authenticated
using ((select auth.uid())::text = id);
