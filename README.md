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
design/                 # design handoff (README = spec, Screens.dc.html, logo SVGs) — source of truth for UI
src/
  app/                  # Expo Router routes only
    _layout.tsx         # providers, fonts, theme, auth/onboarding guards (Stack.Protected)
    sign-in.tsx         # 2a
    (onboarding)/       # 2b timezone · 2k first student · 2l weekly classes
    (app)/
      (tabs)/           # Today · Students · Settings + custom bottom nav
      students/         # new (2h), [id] (2g)
      sessions/[id]/    # reschedule (2e)
  components/
    ui/                 # design-system primitives: Text, Button, Card, TextField, Segmented,
                        # DayChips, Badge, Notice, BottomSheet, Snackbar, Icon, Logo…
    pickers/            # city search, country code, native date/time pickers
  features/             # domain logic per feature: api.ts (Supabase) + queries.ts (React Query)
    auth/ onboarding/ students/ sessions/ reminders/
  lib/                  # supabase client, time + timezone maths (Luxon), places (city → zone)
  theme/                # colors.js (light/dark tokens) + ThemeProvider (CSS variables)
  types/database.ts
supabase/migrations/    # schema, session generation functions, RLS
```

## Conventions

- Times are stored in UTC (`timestamptz`). A weekly schedule is stored in the **student's** local time, so it stays fixed for them across daylight saving; the tutor's time moves. Postgres generates 8 weeks of classes (`generate_sessions` / `ensure_sessions`).
- UI follows `design/README.md`. Use theme tokens (`bg-primary`, `text-muted`, `border-border`…), never raw hex. Use `<Text>` from `components/ui/text` (Plus Jakarta Sans, `weight`, `tabular` for times).
- Each feature has `api.ts` (plain async Supabase calls) and `queries.ts` (React Query hooks). Screens only use the hooks.
- Run `npm run typecheck` before committing.
