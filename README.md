# Tutorbell

A simple Android app for independent online tutors: attendance, rescheduling, per-session notes and WhatsApp class reminders, with timezone support for students abroad.

**Stack:** Expo (SDK 57) · Expo Router · NativeWind v4 · Supabase · TanStack Query · Luxon

## Getting started

1. `npm install`
2. Create a Supabase project, then run `supabase/migrations/0001_init.sql` in the SQL editor.
3. Supabase → Authentication → Providers → enable **Google** (needs a Google Cloud OAuth client).
4. Supabase → Authentication → URL Configuration → add `tutorbell://auth/callback` to Redirect URLs
   (and the `exp://…/--/auth/callback` URL during development).
5. `cp .env.example .env` and fill in the Supabase URL and anon key.
6. `npm start`, then press `a` for Android.

## Folder structure

```
src/
  app/                  # Expo Router routes only (every file is a screen)
    _layout.tsx         # providers + auth guard (Stack.Protected)
    sign-in.tsx
    (app)/
      (tabs)/           # Today · Students · Reschedule · Settings
      students/         # [id].tsx, new.tsx
  features/             # domain logic, grouped by feature
    auth/               # AuthProvider, Google sign-in, profile/tutor timezone
    students/           # api.ts (Supabase calls) + queries.ts (TanStack hooks)
    sessions/           # attendance, reschedule / "decide later", notes
    reminders/          # WhatsApp deep-link reminder
  components/ui/        # shared UI primitives (Screen, Button, EmptyState)
  lib/                  # supabase client, query client, env, time (Luxon helpers)
  types/database.ts     # DB types (regenerate with `supabase gen types`)
supabase/migrations/    # SQL schema + row level security
```

## Conventions

- Times are stored in UTC (`timestamptz`) and converted with Luxon: tutor's zone for the app, student's zone for reminders.
- Each feature has `api.ts` (plain async Supabase calls) and `queries.ts` (React Query hooks). Screens only use the hooks.
- Colors live in `tailwind.config.js` as placeholder tokens (`brand`, `ink`, `surface`…). Swap in the design values.
- Run `npm run typecheck` before committing.
