-- DirectionalTrendEA reporting: structured releases and the one
-- client write (a user claiming their own MT5 login). accounts / trades /
-- equity_snapshots already exist and are NOT recreated here.
-- Create the private `ea-downloads` bucket with the Storage API before
-- uploading release files; bucket creation does not belong in SQL migrations.

do $$ begin
  create type public.ea_release_status as enum ('draft', 'published', 'withdrawn');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.ea_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  file_path text not null,          -- path inside the ea-downloads bucket
  file_name text not null,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[a-fA-F0-9]{64}$'),
  status public.ea_release_status not null default 'draft',
  minimum_mt5_build integer check (minimum_mt5_build is null or minimum_mt5_build > 0),
  release_notes text,
  released_at timestamptz not null default now()
);

alter table public.ea_releases add column if not exists file_name text;
alter table public.ea_releases add column if not exists file_size_bytes bigint;
alter table public.ea_releases add column if not exists checksum_sha256 text;
alter table public.ea_releases add column if not exists status public.ea_release_status not null default 'draft';
alter table public.ea_releases add column if not exists minimum_mt5_build integer;
update public.ea_releases set file_name = file_path where file_name is null;
alter table public.ea_releases alter column file_name set not null;
create unique index if not exists ea_releases_version_key on public.ea_releases (version);

grant select on public.ea_releases to authenticated;
grant all on public.ea_releases to service_role;
alter table public.ea_releases enable row level security;
drop policy if exists "Anyone can read EA releases" on public.ea_releases;
drop policy if exists "Signed-in users read published EA releases" on public.ea_releases;
create policy "Signed-in users read published EA releases" on public.ea_releases
  for select to authenticated using (status = 'published');

drop policy if exists "Public read ea-downloads" on storage.objects;
drop policy if exists "Signed-in users download published EA releases" on storage.objects;
create policy "Signed-in users download published EA releases" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'ea-downloads'
    and exists (
      select 1 from public.ea_releases
      where status = 'published' and file_path = name
    )
  );

-- Users may authorize their own MT5 login (status stays at its default).
grant insert on public.accounts to authenticated;
drop policy if exists "Users authorize their own MT5 login" on public.accounts;
create policy "Users authorize their own MT5 login" on public.accounts
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'inactive');
-- mt5_login uniqueness is enforced by the existing unique constraint.
