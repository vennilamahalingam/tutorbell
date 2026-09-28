-- Tutorbell initial schema. Run in Supabase SQL editor or via `supabase db push`.
-- All times are stored as timestamptz (UTC); zones are IANA names.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  whatsapp_number text,            -- E.164, e.g. +14155550123
  timezone text not null,          -- student's IANA zone
  default_duration_minutes int not null default 60,
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create type public.session_status as enum (
  'scheduled', 'attended', 'absent', 'to_reschedule', 'cancelled'
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  starts_at timestamptz,           -- null while in the "decide later" list
  duration_minutes int not null default 60,
  status public.session_status not null default 'scheduled',
  original_starts_at timestamptz,  -- set when a session is rescheduled
  note text,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint starts_at_required check (status = 'to_reschedule' or starts_at is not null)
);

create index sessions_tutor_starts_idx on public.sessions (tutor_id, starts_at);
create index sessions_student_idx on public.sessions (student_id);

-- updated_at
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger sessions_touch before update on public.sessions
  for each row execute function public.touch_updated_at();

-- Create a profile on sign-up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row level security: tutors only see their own data
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own students" on public.students
  for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "own sessions" on public.sessions
  for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
