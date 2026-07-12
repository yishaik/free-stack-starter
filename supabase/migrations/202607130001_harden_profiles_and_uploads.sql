create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles enable row level security;

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  object_key text not null unique,
  original_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  status text not null default 'pending' check (status in ('pending', 'complete', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.uploads enable row level security;

create index if not exists uploads_owner_created_idx
  on public.uploads (owner_id, created_at desc);

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "read own uploads" on public.uploads;
create policy "read own uploads" on public.uploads for select using (auth.uid() = owner_id);

drop policy if exists "insert own uploads" on public.uploads;
create policy "insert own uploads" on public.uploads for insert with check (auth.uid() = owner_id);

drop policy if exists "update own uploads" on public.uploads;
create policy "update own uploads" on public.uploads for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
