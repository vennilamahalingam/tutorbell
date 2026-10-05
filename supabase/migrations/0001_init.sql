-- Tutorbell schema v2 — weekly schedules (design/README.md → "State / Data model").
-- Fresh install: run this whole file in the Supabase SQL editor.
--
-- Time rules
--  * Class times are stored as timestamptz (UTC).
--  * A student's weekly schedule is stored in the STUDENT's local time and weekdays, so
--    their class stays at e.g. 11:00 AM for them across daylight-saving changes; the
--    tutor's time shifts instead (and Today shows a notice).
--  * Postgres does the zone maths: (date + time) AT TIME ZONE 'Europe/London'.

-- ─── Reset (v1 tables) ────────────────────────────────────────────────────────
drop table if exists public.sessions cascade;
drop table if exists public.students cascade;
drop table if exists public.blocked_times cascade;
drop table if exists public.profiles cascade;
drop type if exists public.session_status cascade;
drop type if exists public.requested_by cascade;
drop function if exists public.handle_new_user cascade;
drop function if exists public.touch_updated_at cascade;

-- ─── Profiles (tutor + settings) ─────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  timezone text not null default 'UTC',          -- set from the phone during onboarding
  city text,                                      -- display label, e.g. "Kolkata"
  reminder_template text not null default 'Upcoming session today at {time}.',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  calendar_sync boolean not null default false,
  onboarded_at timestamptz,                       -- null → show onboarding
  created_at timestamptz not null default now()
);

-- Blocked time, in the tutor's local time (e.g. daily 1:00–2:30 PM).
create table public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  weekdays smallint[] not null default '{1,2,3,4,5,6,7}',  -- ISO: 1 = Mon … 7 = Sun
  starts time not null,
  ends time not null,
  check (ends > starts)
);

-- ─── Students ────────────────────────────────────────────────────────────────
create table public.students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  whatsapp_number text,                 -- E.164, e.g. +14155550123
  city text not null,                   -- e.g. "London"
  country text,                         -- e.g. "United Kingdom"
  timezone text not null,               -- IANA, e.g. "Europe/London"
  duration_minutes int not null default 60 check (duration_minutes between 15 and 240),
  schedule_weekdays smallint[] not null default '{}',  -- in the STUDENT's week (ISO 1–7)
  schedule_time time,                                   -- in the STUDENT's local time
  start_date date not null default current_date,        -- in the student's calendar
  paused boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Sessions (one row per class) ────────────────────────────────────────────
create type public.session_status as enum (
  'scheduled', 'attended', 'absent', 'cancelled', 'pending_reschedule'
);
create type public.requested_by as enum ('student', 'tutor');

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  slot_at timestamptz not null,         -- the weekly slot this class came from (never changes)
  starts_at timestamptz,                -- actual time; null while "Decide later"
  duration_minutes int not null,
  status public.session_status not null default 'scheduled',
  moved_from timestamptz,               -- previous time, when rescheduled
  requested_by public.requested_by,     -- who asked for the reschedule
  reminder_sent_at timestamptz,
  note text check (char_length(note) <= 140),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, slot_at),
  check (status = 'pending_reschedule' or starts_at is not null)
);

create index sessions_tutor_starts_idx on public.sessions (tutor_id, starts_at);

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger sessions_touch before update on public.sessions
  for each row execute function public.touch_updated_at();

-- ─── Session generation ──────────────────────────────────────────────────────
-- Creates sessions for a student's weekly slots from max(start_date, today) up to
-- `weeks_ahead` weeks out. Safe to call repeatedly (unique on student_id + slot_at).
create or replace function public.generate_sessions(p_student_id uuid, weeks_ahead int default 8)
returns int language plpgsql security invoker as $$
declare
  s public.students;
  d date;
  first_day date;
  inserted int := 0;
  n int;
begin
  select * into s from public.students where id = p_student_id;
  if not found or s.paused or s.schedule_time is null then return 0; end if;

  first_day := greatest(s.start_date, (now() at time zone s.timezone)::date);
  for d in
    select g::date from generate_series(first_day, first_day + weeks_ahead * 7, interval '1 day') g
  loop
    -- Only future slots: a new student shouldn't land in "Needs attendance" straight away.
    if extract(isodow from d)::smallint = any (s.schedule_weekdays)
       and ((d + s.schedule_time) at time zone s.timezone) > now() then
      insert into public.sessions (tutor_id, student_id, slot_at, starts_at, duration_minutes)
      values (s.tutor_id, s.id, (d + s.schedule_time) at time zone s.timezone,
              (d + s.schedule_time) at time zone s.timezone, s.duration_minutes)
      on conflict (student_id, slot_at) do nothing;
      get diagnostics n = row_count;
      inserted := inserted + n;
    end if;
  end loop;
  return inserted;
end $$;

-- Tops up every active student of the signed-in tutor. Call on app open.
create or replace function public.ensure_sessions(weeks_ahead int default 8)
returns int language plpgsql security invoker as $$
declare
  st record;
  total int := 0;
begin
  for st in select id from public.students where tutor_id = auth.uid() and not paused loop
    total := total + public.generate_sessions(st.id, weeks_ahead);
  end loop;
  return total;
end $$;

-- After a schedule edit or pause: drop future classes nobody has touched, then regenerate.
-- Moved / marked / reminded classes are kept.
create or replace function public.reset_future_sessions(p_student_id uuid)
returns int language plpgsql security invoker as $$
begin
  delete from public.sessions
  where student_id = p_student_id
    and status = 'scheduled'
    and moved_from is null
    and reminder_sent_at is null
    and note is null
    and starts_at > now();
  return public.generate_sessions(p_student_id);
end $$;

-- ─── New user → profile ──────────────────────────────────────────────────────
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Existing users (signed up before this migration) get a profile too.
insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name' from auth.users
on conflict (id) do nothing;

-- ─── Row level security: tutors only see their own data ──────────────────────
alter table public.profiles enable row level security;
alter table public.blocked_times enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own blocked times" on public.blocked_times
  for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "own students" on public.students
  for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "own sessions" on public.sessions
  for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
