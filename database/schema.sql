-- Tamil Nadu Samacheer Kalvi Digital Learning Platform
-- Core prototype schema reference.

create table if not exists profiles (
  id uuid primary key,
  full_name text not null,
  emis_number text,
  mobile_number text,
  district text,
  school_name text,
  class text,
  section text,
  language_preference text default 'ta',
  email text,
  location_label text,
  location_latitude double precision,
  location_longitude double precision,
  location_place_id text
);

create table if not exists user_roles (
  user_id uuid primary key references profiles(id),
  role text not null,
  district text
);

create table if not exists materials (
  id text primary key,
  title text not null,
  title_ta text,
  class text not null,
  subject text not null,
  subject_ta text,
  chapter text,
  type text not null,
  language text default 'ta',
  medium text,
  url text not null,
  source text,
  created_at timestamptz default now()
);

create table if not exists videos (
  id text primary key,
  title text not null,
  title_ta text,
  class text not null,
  subject text not null,
  subject_ta text,
  chapter text,
  url text not null,
  source text,
  thumbnail_url text,
  duration_minutes int,
  created_at timestamptz default now()
);

create table if not exists events (
  id text primary key,
  title text not null,
  title_ta text,
  description text,
  event_date date not null,
  event_time text,
  venue text,
  eligibility text,
  target_class text,
  district text,
  registration_url text
);

create table if not exists notifications (
  id text primary key,
  title text not null,
  message text not null,
  target_type text not null,
  target_value text,
  created_at timestamptz default now(),
  read_status boolean default false
);

create table if not exists activity_logs (
  id text primary key,
  user_id text,
  user_name text,
  school_name text,
  district text,
  class text,
  event_type text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists feedback (
  id text primary key,
  student_id text,
  category text,
  message text,
  status text default 'open',
  response text,
  district text,
  created_at timestamptz default now()
);

