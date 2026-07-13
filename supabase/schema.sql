-- Free Stack Directory database schema.
-- Run this file in Supabase SQL Editor. It is safe to run repeatedly.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- Profiles
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- User stacks and saved services
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.user_stacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My Stack'
    check (char_length(name) between 1 and 80),
  description text not null default ''
    check (char_length(description) <= 500),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_stacks_user_id_idx
  on public.user_stacks (user_id, created_at desc);

create unique index if not exists user_stacks_one_default_per_user_idx
  on public.user_stacks (user_id)
  where is_default;

create table if not exists public.stack_services (
  stack_id uuid not null references public.user_stacks (id) on delete cascade,
  service_id text not null
    check (service_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(service_id) <= 120),
  notes text not null default ''
    check (char_length(notes) <= 1000),
  added_at timestamptz not null default now(),
  primary key (stack_id, service_id)
);

create index if not exists stack_services_service_id_idx
  on public.stack_services (service_id);

alter table public.user_stacks enable row level security;
alter table public.stack_services enable row level security;

drop policy if exists "read own stacks" on public.user_stacks;
create policy "read own stacks"
  on public.user_stacks for select
  using ((select auth.uid()) = user_id);

drop policy if exists "insert own stacks" on public.user_stacks;
create policy "insert own stacks"
  on public.user_stacks for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "update own stacks" on public.user_stacks;
create policy "update own stacks"
  on public.user_stacks for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "delete own stacks" on public.user_stacks;
create policy "delete own stacks"
  on public.user_stacks for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "read services in own stacks" on public.stack_services;
create policy "read services in own stacks"
  on public.stack_services for select
  using (
    exists (
      select 1 from public.user_stacks
      where user_stacks.id = stack_services.stack_id
        and user_stacks.user_id = (select auth.uid())
    )
  );

drop policy if exists "insert services into own stacks" on public.stack_services;
create policy "insert services into own stacks"
  on public.stack_services for insert
  with check (
    exists (
      select 1 from public.user_stacks
      where user_stacks.id = stack_services.stack_id
        and user_stacks.user_id = (select auth.uid())
    )
  );

drop policy if exists "update services in own stacks" on public.stack_services;
create policy "update services in own stacks"
  on public.stack_services for update
  using (
    exists (
      select 1 from public.user_stacks
      where user_stacks.id = stack_services.stack_id
        and user_stacks.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.user_stacks
      where user_stacks.id = stack_services.stack_id
        and user_stacks.user_id = (select auth.uid())
    )
  );

drop policy if exists "delete services from own stacks" on public.stack_services;
create policy "delete services from own stacks"
  on public.stack_services for delete
  using (
    exists (
      select 1 from public.user_stacks
      where user_stacks.id = stack_services.stack_id
        and user_stacks.user_id = (select auth.uid())
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_stacks_set_updated_at on public.user_stacks;
create trigger user_stacks_set_updated_at
  before update on public.user_stacks
  for each row execute function public.set_updated_at();

-- Table privileges. RLS (above) decides WHICH ROWS each role may touch; these grants
-- let the `authenticated` role issue the query in the first place. Without them,
-- PostgREST returns "42501 permission denied" for signed-in users even with policies,
-- because some Supabase environments do not grant DML on new tables by default.
-- `anon` is intentionally excluded: My Stack requires authentication, and anonymous
-- stacks live only in the browser (localStorage), never in these tables.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_stacks to authenticated;
grant select, insert, update, delete on public.stack_services to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Private, atomic rate-limit storage
-- ─────────────────────────────────────────────────────────────────────────────

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table if not exists private.rate_limits (
  bucket_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  updated_at timestamptz not null default now()
);

revoke all on table private.rate_limits from public, anon, authenticated;

create or replace function public.consume_rate_limit(
  p_bucket_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
  v_window_started_at timestamptz;
begin
  if p_limit < 1 or p_limit > 10000 then
    raise exception 'invalid rate limit';
  end if;

  if p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate-limit window';
  end if;

  if char_length(p_bucket_hash) < 32 or char_length(p_bucket_hash) > 128 then
    raise exception 'invalid rate-limit bucket';
  end if;

  insert into private.rate_limits as current_limit (
    bucket_hash,
    window_started_at,
    request_count,
    updated_at
  ) values (
    p_bucket_hash,
    v_now,
    1,
    v_now
  )
  on conflict (bucket_hash) do update set
    window_started_at = case
      when current_limit.window_started_at + make_interval(secs => p_window_seconds) <= v_now
        then v_now
      else current_limit.window_started_at
    end,
    request_count = case
      when current_limit.window_started_at + make_interval(secs => p_window_seconds) <= v_now
        then 1
      else current_limit.request_count + 1
    end,
    updated_at = v_now
  returning request_count, window_started_at
  into v_count, v_window_started_at;

  return query select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    v_window_started_at + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
revoke all on function public.consume_rate_limit(text, integer, integer) from anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- Optional maintenance helper. Invoke from a trusted scheduled job.
create or replace function public.cleanup_expired_rate_limits(p_older_than interval default interval '2 days')
returns integer
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  deleted_count integer;
begin
  delete from private.rate_limits
  where updated_at < clock_timestamp() - p_older_than;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_expired_rate_limits(interval) from public;
revoke all on function public.cleanup_expired_rate_limits(interval) from anon, authenticated;
grant execute on function public.cleanup_expired_rate_limits(interval) to service_role;
