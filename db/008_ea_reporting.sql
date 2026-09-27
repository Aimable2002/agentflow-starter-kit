-- DirectionalTrendEA reporting: release table, download bucket, and the one
-- client write (a user claiming their own MT5 login). accounts / trades /
-- equity_snapshots already exist and are NOT recreated here.

create table if not exists public.ea_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  file_path text not null,          -- path inside the ea-downloads bucket
  release_notes text,
  released_at timestamptz not null default now()
);
grant select on public.ea_releases to anon, authenticated;
grant all on public.ea_releases to service_role;
alter table public.ea_releases enable row level security;
drop policy if exists "Anyone can read EA releases" on public.ea_releases;
create policy "Anyone can read EA releases" on public.ea_releases
  for select to anon, authenticated using (true);

-- Public download bucket
insert into storage.buckets (id, name, public)
values ('ea-downloads', 'ea-downloads', true)
on conflict (id) do nothing;
drop policy if exists "Public read ea-downloads" on storage.objects;
create policy "Public read ea-downloads" on storage.objects
  for select to anon, authenticated using (bucket_id = 'ea-downloads');

-- Users may connect their own MT5 login (status stays at its default).
grant insert on public.accounts to authenticated;
drop policy if exists "Users connect their own MT5 login" on public.accounts;
create policy "Users connect their own MT5 login" on public.accounts
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'inactive');
-- mt5_login uniqueness is enforced by the existing unique constraint.
