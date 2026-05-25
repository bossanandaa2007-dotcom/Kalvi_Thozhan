-- KalviThozhan Supabase schema snapshot.
-- This matches the final state produced by the migrations in supabase/migrations.

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('student', 'teacher', 'district_admin', 'super_admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  emis_number text unique,
  mobile_number text,
  district text,
  school_name text,
  class text,
  section text,
  subject text,
  language_preference text not null default 'ta',
  email text,
  location_label text,
  location_latitude double precision,
  location_longitude double precision,
  location_place_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  district text,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text not null,
  type text,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ta text,
  class text not null,
  subject text not null,
  subject_ta text,
  chapter text,
  type text not null,
  language text not null default 'ta',
  url text not null,
  source text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ta text,
  class text not null,
  subject text not null,
  subject_ta text,
  chapter text,
  url text not null,
  source text,
  thumbnail_url text,
  duration_minutes integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ta text,
  description text,
  event_date date not null,
  event_time text,
  venue text,
  target_class text,
  district text,
  registration_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  target_type text not null default 'all',
  target_value text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  school_name text,
  district text,
  class text,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade,
  category text not null default 'general',
  message text not null,
  status text not null default 'open',
  response text,
  district text,
  created_at timestamptz not null default now()
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.get_user_district(_user_id uuid)
returns text
language sql stable security definer set search_path = public
as $$
  select district
  from public.user_roles
  where user_id = _user_id
  limit 1
$$;

create index if not exists idx_materials_class on public.materials(class);
create index if not exists idx_videos_class on public.videos(class);
create index if not exists idx_activity_district on public.activity_logs(district, created_at desc);
create index if not exists idx_schools_district on public.schools(district);
