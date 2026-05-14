-- ============================================================================
-- Golive Academy — Supabase schema
-- Run this once in the Supabase SQL Editor (one-shot, idempotent-ish).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tables
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  photo_url     text,
  role          text not null default 'student' check (role in ('student','superadmin')),
  course_ids    text[] not null default '{}',
  created_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null,
  last_login_at timestamptz
);

create index if not exists profiles_email_idx on public.profiles(lower(email));

create table if not exists public.progress (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  text not null,
  step_id    text not null,
  completed  boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, step_id)
);

create index if not exists progress_user_course_idx
  on public.progress(user_id, course_id);

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  user_name   text,
  user_photo  text,
  course_id   text not null,
  session_id  text not null,
  text        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists comments_course_session_idx
  on public.comments(course_id, session_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 2) Helper: is the current user a superadmin?
--    SECURITY DEFINER so it bypasses RLS when called from policies.
-- ----------------------------------------------------------------------------

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'superadmin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ----------------------------------------------------------------------------
-- 3) Trigger: auto-create a profile on signup. The hardcoded superadmin email
--    is granted role='superadmin' automatically on first login.
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, display_name, photo_url, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    case when lower(new.email) = '1.del.198333@gmail.com'
         then 'superadmin' else 'student' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4) Trigger: prevent students from changing their own role or course_ids.
--    Superadmins can change anything; their RLS update policy permits the row.
-- ----------------------------------------------------------------------------

create or replace function public.enforce_profile_protection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin() then
    if new.role is distinct from old.role then
      raise exception 'Only superadmin can change role';
    end if;
    if new.course_ids is distinct from old.course_ids then
      raise exception 'Only superadmin can change course assignments';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.enforce_profile_protection();

-- ----------------------------------------------------------------------------
-- 5) Row Level Security
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.comments enable row level security;

-- profiles
drop policy if exists "profiles read self or admin" on public.profiles;
create policy "profiles read self or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_superadmin());

drop policy if exists "profiles update self or admin" on public.profiles;
create policy "profiles update self or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_superadmin());

drop policy if exists "profiles insert admin" on public.profiles;
create policy "profiles insert admin"
  on public.profiles for insert
  with check (public.is_superadmin());

drop policy if exists "profiles delete admin" on public.profiles;
create policy "profiles delete admin"
  on public.profiles for delete
  using (public.is_superadmin());

-- progress
drop policy if exists "progress read self or admin" on public.progress;
create policy "progress read self or admin"
  on public.progress for select
  using (auth.uid() = user_id or public.is_superadmin());

drop policy if exists "progress insert self" on public.progress;
create policy "progress insert self"
  on public.progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progress update self" on public.progress;
create policy "progress update self"
  on public.progress for update
  using (auth.uid() = user_id);

drop policy if exists "progress delete self or admin" on public.progress;
create policy "progress delete self or admin"
  on public.progress for delete
  using (auth.uid() = user_id or public.is_superadmin());

-- comments
drop policy if exists "comments read authenticated" on public.comments;
create policy "comments read authenticated"
  on public.comments for select
  to authenticated
  using (true);

drop policy if exists "comments insert self" on public.comments;
create policy "comments insert self"
  on public.comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "comments update self" on public.comments;
create policy "comments update self"
  on public.comments for update
  using (auth.uid() = user_id);

drop policy if exists "comments delete self or admin" on public.comments;
create policy "comments delete self or admin"
  on public.comments for delete
  using (auth.uid() = user_id or public.is_superadmin());

-- ----------------------------------------------------------------------------
-- 6) Realtime publications
-- ----------------------------------------------------------------------------

alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.progress;
alter publication supabase_realtime add table public.comments;
