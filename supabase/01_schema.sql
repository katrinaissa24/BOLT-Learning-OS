-- ============================================================
-- BOLT · Boring Old Learning, Transformed — Supabase schema
-- Run this FIRST in the Supabase SQL editor (idempotent).
-- ============================================================
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('student','teacher','parent')),
  grade int,
  avatar text,
  child_id uuid,
  title text,
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  subject text not null,
  grade int,
  description text,
  color text,
  icon text,
  teacher_id uuid,
  exam_date date
);

create table if not exists public.lessons (
  id text primary key,
  course_id text references public.courses(id) on delete cascade,
  position int not null,
  title text not null,
  youtube_id text,
  duration_min int,
  summary text,
  topics jsonb default '[]'::jsonb,
  skills jsonb default '[]'::jsonb,
  interactive text,
  transcript jsonb default '[]'::jsonb
);

create table if not exists public.enrollments (
  student_id uuid references public.profiles(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  primary key (student_id, course_id)
);

create table if not exists public.lesson_progress (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete cascade,
  status text not null default 'in-progress',
  score int,
  topic_scores jsonb default '{}'::jsonb,
  completed_at timestamptz,
  time_spent_min int default 0,
  unique (student_id, lesson_id)
);

create table if not exists public.point_events (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  points int not null,
  reason text,
  created_at timestamptz default now()
);

create table if not exists public.badges (
  id text primary key,
  name text not null,
  category text,
  skill text,
  icon text,
  rarity text,
  description text,
  how_to_earn text
);

create table if not exists public.student_badges (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  badge_id text references public.badges(id) on delete cascade,
  earned_at timestamptz default now(),
  evidence text,
  unique (student_id, badge_id)
);

create table if not exists public.monthly_awards (
  id text primary key,
  course_id text references public.courses(id) on delete cascade,
  month text not null,
  student_id uuid references public.profiles(id) on delete cascade,
  rank int not null
);

create table if not exists public.schedule (
  id text primary key,
  day int not null,
  "start" text not null,
  "end" text not null,
  course_id text,
  label text,
  room text
);

create table if not exists public.attendance (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present','late','absent','excused')),
  note text,
  flag text
);

create table if not exists public.submissions (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete cascade,
  type text default 'essay',
  title text,
  content text,
  process jsonb,
  metrics jsonb,
  ai_usage jsonb,
  submitted_at timestamptz default now(),
  grade numeric,
  teacher_feedback text,
  status text default 'submitted'
);

create table if not exists public.chat_messages (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete cascade,
  role text default 'user',
  content text,
  video_t numeric,
  topic text,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  skills jsonb default '[]'::jsonb,
  course_id text,
  status text default 'pending',
  validated_by uuid,
  artifact text,
  created_at timestamptz default now()
);

create table if not exists public.practice_sets (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  lesson_id text,
  items jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- ---------- Row level security (prototype: any signed-in user can read/write) ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','courses','lessons','enrollments','lesson_progress','point_events','badges','student_badges','monthly_awards','schedule','attendance','submissions','chat_messages','projects','practice_sets'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "bolt_read" on public.%I', t);
    execute format('drop policy if exists "bolt_write" on public.%I', t);
    execute format('create policy "bolt_read" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "bolt_write" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------- Link auth users to profiles automatically ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare existing public.profiles%rowtype;
begin
  select * into existing from public.profiles where email = lower(new.email);
  if found then
    update public.profiles set auth_id = new.id where id = existing.id;
  else
    insert into public.profiles (auth_id, email, full_name, role, grade, avatar, child_id, title)
    values (
      new.id,
      lower(new.email),
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'role', 'student'),
      case when coalesce(new.raw_user_meta_data->>'role','student') = 'student' then 12 else null end,
      upper(left(coalesce(new.raw_user_meta_data->>'full_name', new.email), 2)),
      case when new.raw_user_meta_data->>'role' = 'parent' then '00000000-0000-4000-8000-000000000010'::uuid else null end,
      case coalesce(new.raw_user_meta_data->>'role','student') when 'student' then 'Grade 12 · Section A' when 'teacher' then 'Teacher · Grade 12' else 'Parent' end
    );
    -- new students are enrolled in every course
    if coalesce(new.raw_user_meta_data->>'role','student') = 'student' then
      insert into public.enrollments (student_id, course_id)
      select p.id, c.id from public.profiles p cross join public.courses c where p.auth_id = new.id
      on conflict do nothing;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();
