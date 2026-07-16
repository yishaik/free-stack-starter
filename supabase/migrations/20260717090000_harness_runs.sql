-- AI Project Harness run history.
-- Each authenticated user can access only their own runs through RLS.

create extension if not exists pgcrypto;

create table if not exists public.harness_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  repository text not null
    check (repository ~ '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\.git$' and char_length(repository) <= 240),
  git_ref text not null default 'main'
    check (git_ref ~ '^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$' and git_ref not like '%..%' and git_ref not like '%//%'),
  mode text not null
    check (mode in ('inspect', 'test', 'build')),
  task text not null default ''
    check (char_length(task) <= 2000),
  command text not null
    check (char_length(command) between 1 and 20000),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed')),
  exit_code integer,
  output text,
  ai_summary text
    check (ai_summary is null or char_length(ai_summary) <= 4000),
  sandbox_id text
    check (sandbox_id is null or char_length(sandbox_id) <= 160),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists harness_runs_user_created_idx
  on public.harness_runs (user_id, created_at desc);

alter table public.harness_runs enable row level security;

drop policy if exists "read own harness runs" on public.harness_runs;
create policy "read own harness runs"
  on public.harness_runs for select
  using ((select auth.uid()) = user_id);

drop policy if exists "insert own harness runs" on public.harness_runs;
create policy "insert own harness runs"
  on public.harness_runs for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "update own harness runs" on public.harness_runs;
create policy "update own harness runs"
  on public.harness_runs for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "delete own harness runs" on public.harness_runs;
create policy "delete own harness runs"
  on public.harness_runs for delete
  using ((select auth.uid()) = user_id);

drop trigger if exists harness_runs_set_updated_at on public.harness_runs;
create trigger harness_runs_set_updated_at
  before update on public.harness_runs
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.harness_runs to authenticated;
revoke all on public.harness_runs from anon;
