# Tutorbell — Design Brief (V1)

## 1. The product

Tutorbell is a simple Android app for independent online tutors who teach one-to-one. It helps them track attendance, reschedule classes easily, keep a short note per session, and remind students on WhatsApp.

- **User:** an independent tutor, usually in India, teaching students who live abroad (UK, US, Australia, etc.).
- **Core problem:** classes are rescheduled often (rarely cancelled), and timezone and daylight saving differences make it easy to confuse or miss a class.
- **Usage:** opened several times a day, often in the evening. It must feel calm, fast and dependable.
- **Platform:** Android first (design with Android / Material conventions), iOS later from the same designs.

## 2. Design direction

**"A calm class register with a friendly bell."**

- Simple, easy to understand, trustworthy.
- Not flashy. Mostly neutral screens; color only where it carries meaning.
- Slightly playful and witty, but only in small, low-stakes moments.
- Times are the hero of every screen.

## 3. Color

### Core

| Role | Name | Hex |
|---|---|---|
| Primary (actions, buttons, links) | Teal ink | #1E5F74 |
| Accent (reminders, bell, small highlights) | Bell brass | #E9A23B |
| Background | Paper (warm off-white) | #FAF7F2 |
| Surface (cards, sheets) | White | #FFFFFF |
| Card border | Warm hairline | #E4DED2 |
| Primary text | Ink | #1D2433 |
| Secondary text | Slate | #5B6475 |

### Class status (used as small badges only)

| Status | Color | Badge background | Badge text |
|---|---|---|---|
| Attended | #2E8B57 | #E3F1E9 | #1F5E3B |
| Absent | #D1564B | #FBE7E5 | #8E2F27 |
| Rescheduled | #6E56CF | #ECE8FA | #3F2F8F |
| Cancelled | #8C93A0 | #EEF0F3 | #4E5563 |
| Reminder sent | uses Attended green | #E3F1E9 | #1F5E3B |

### Dark mode (required in V1)

- Background: deep navy-charcoal, around #151A22 (not pure black)
- Surface: around #1E2430
- Keep teal and brass, slightly brightened for contrast
- Status colors: same hues, lighter text on darker badge backgrounds

## 4. Typography

- One friendly, highly readable sans-serif: **Plus Jakarta Sans** (alternative: Nunito Sans).
- Two weights only: regular and semibold.
- Use **tabular numbers** for all times so they line up in lists.
- Suggested sizes: class time 20sp semibold, screen title 18–20sp, body 14–16sp, secondary 12–13sp.

## 5. Shape, spacing and icons

- Rounded corners: 12–16px on cards, 8px on buttons and badges.
- Touch targets at least 48dp.
- Generous spacing; no shadows or gradients (flat, clean surfaces with hairline borders).
- Icons: rounded outline set (e.g. Material Symbols Rounded).
- The **bell** is the logo and the reminder icon.
- Motion: one small delight only — the bell icon gives a tiny wiggle when a reminder is sent. Everything else stays still and fast.

## 6. Navigation

Bottom navigation with three tabs: **Today**, **Students**, **Settings**.

Class actions open in a **bottom sheet**.

## 7. Screens to design

1. **Sign in** — Google sign-in only (one button).
2. **Onboarding** — confirm timezone, add first student, land on Today.
3. **Today (home)** — the most important screen.
   - Date and count, e.g. "Friday, 25 Sep · Today · 3 classes"
   - "Needs attendance" section (past classes not yet marked)
   - "To reschedule" section (classes marked "Decide later")
   - Class cards in time order
4. **Class actions (bottom sheet)** — Send reminder, Mark attendance, Reschedule.
5. **Mark attendance** — Attended / Absent / Cancelled + optional short note.
6. **Reschedule** — date and time picker showing both times, "who asked" (student / me), "Decide later" option, clash warning, "send new time on WhatsApp?"
7. **Students list** — name, next class, student's local time.
8. **Student details** — upcoming classes, past sessions with status and notes, monthly summary (attended, rescheduled, absent, cancelled), edit schedule, pause student.
9. **Add / Edit student** — name, WhatsApp number with country code, country or city (sets timezone), weekly schedule (days, time, length), start date.
10. **Settings** — tutor timezone, reminder message text, blocked time, Google Calendar sync (off by default).

## 8. Class card anatomy

- **Tutor's time** — large, semibold (e.g. "7:30 PM")
- **Student name**
- **Student's local time and day** — smaller, secondary text, always with the day because it can differ (e.g. "10:00 AM Fri in New York")
- **Status badge** — top right (e.g. "Reminder sent", "Moved from Thu")
- **Actions** — primary "Remind" button (teal, bell icon) and secondary "Reschedule" button (outline)

## 9. Timezone display rules

- Every time shows the tutor's time first, with the student's local time and day beside or under it.
- The Today screen follows the tutor's day.
- WhatsApp messages always use the student's local time.
- Daylight saving warning appears as a calm banner, e.g. "From 2 Nov, Emma's class moves to 7:30 PM your time."

## 10. Voice and microcopy

**Plain first. Wit only in low-stakes moments, at most once per screen.** Never joke in times, clashes, errors or daylight saving warnings.

| Moment | Copy |
|---|---|
| Empty day | No classes today. The bell's taking a nap. |
| All reminders sent | Everyone's been rung. |
| Attendance up to date | Register's all caught up. Chai break? |
| Class moved | Done. Aarav now rings on Thu at 6:00 PM. |
| Pending attendance | 2 classes from yesterday need attendance. |
| Daylight saving warning | From 2 Nov, Emma's class moves to 7:30 PM your time. |
| Clash warning | Clashes with Aarav, Thu 6:00–7:00 PM. |
| Default WhatsApp reminder | Upcoming session today at 9:30 AM. |

Style rules: sentence case, short sentences, contractions, no exclamation marks on system messages.

## 11. Don'ts

- No bright gradients, heavy shadows or busy illustrations.
- Don't use status colors for decoration.
- Don't hide the student's time — timezones are a core feature.
- Don't make the tutor dig for today's classes; Today is always the home screen.
