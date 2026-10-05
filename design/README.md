# Handoff: Tutorbell — Android app V1

## Overview
Tutorbell is a mobile (Android) app for 1:1 tutors teaching students across timezones. It tracks attendance, handles rescheduling with dual-timezone display, and sends class reminders via WhatsApp. This bundle covers onboarding, Today (home), attendance, reschedule, students, student details, add student, settings, empty state, dark mode, and the logo.

`Tutorbell_Design_Brief.md` is the original product brief — read it alongside this file.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code. Recreate them in the target codebase's environment (recommended if none exists: **Kotlin + Jetpack Compose, Material 3**, or Flutter). Do not ship the HTML.

Open `Tutorbell Screens.dc.html` in a browser (keep `support.js` next to it). Each screen is labelled with an id (2a, 2b…) referenced below.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii and copy are final. Recreate pixel-close using native components. Frames are 360×760 dp (standard Android). Status bar in mocks is decorative — use the system status bar.

---

## Global layout
- Screen background `#FAF7F2`. Horizontal content padding 16dp (lists) / 24dp (onboarding, forms).
- Top area: screen title 20sp/600 at 20dp horizontal padding, 12dp vertical. Subtitle 13sp `#5B6475`, 2dp below.
- **Bottom navigation** (Today / Students / Settings): height 72dp, white, top border 1dp `#E4DED2`. Icon 22dp + label 12sp. Active: icon inside pill 4×18dp padding, bg `#DCEAEE`, color `#1E5F74`, label 600. Inactive: `#5B6475`. (Material 3 NavigationBar maps directly.)
- **Section labels**: 12sp/600, uppercase, letter-spacing 0.6sp, `#5B6475`, 4dp horizontal inset.
- **Cards**: white, 1dp border `#E4DED2`, radius 14dp, padding 16dp (list rows 14×16dp). No shadows.
- **Primary button**: bg `#1E5F74`, text white 15sp/600, height 52dp (in-card 44dp), radius 8dp. Pressed `#174B5C`.
- **Secondary button**: white, 1dp border `#E4DED2`, text `#1D2433` 600. Pressed bg `#FAF7F2`.
- **Outlined accent button** (inline "Mark", "Pick time"): height 40dp, 14dp h-padding, 1dp border `#1E5F74`, text `#1E5F74` 13sp/600, no wrap.
- **Inputs**: height 52dp, white, 1dp border `#E4DED2`, radius 12dp, 14dp h-padding, 15sp. Focused: 2dp border `#1E5F74`. Field label 13sp/600 `#5B6475`, 6dp above.
- **Segmented control**: track `#EEEAE2`, radius 8dp, 4dp padding; options 40dp tall; selected = white bg, radius 6dp, 600.
- **Switch**: 48×28dp, on `#1E5F74`, off `#E4DED2`, white 22dp knob. Use M3 Switch tinted.
- **Day chips** (M T W T F S S): 40dp circles, gap 6dp. Selected `#1E5F74` bg / white 600; unselected white with border.
- **Bottom sheets**: white, top radius 20dp, 10dp top padding, 20dp sides, 28dp bottom; drag handle 36×4dp `#E4DED2`. Scrim `rgba(29,36,51,0.4)`.
- All times use **tabular numerals**. Tutor's time is always primary (larger, darker); student's time secondary in `#5B6475` with format `"{time} {Day} in {City}"`, e.g. `1:30 PM Fri in London`.

## Screens

### 2a Sign in
- Logo icon 72dp (top of a vertically centered stack, 20dp gaps, 28dp side padding).
- Headline "Every class,\non time. Both times." 30sp/600, letter-spacing −0.6, line-height 1.15.
- Body "Track attendance, reschedule without timezone maths, and ring students on WhatsApp." 15sp, `#5B6475`, lh 1.5.
- Bottom (24dp sides, 40dp bottom): "Continue with Google" secondary button 52dp with Google logo (use official asset); caption "Your data stays in your account." 12sp centered.

### Onboarding (3 steps)
Shared: progress bar of 3 segments, 4dp tall, radius 4dp, gap 6dp, filled `#1E5F74`, empty `#E4DED2`; top padding 16dp. Header block 28dp below: "Step N of 3" 12sp/600 muted, title 24sp/600 (ls −0.4), body 14sp muted lh 1.5. CTA pinned bottom (24dp sides, 32dp bottom).

**2b Step 1 — timezone.** Title "Where do you teach from?" Body "We'll show every class in your time first, with your student's time beside it." Detected option card (2dp `#1E5F74` border): `my_location` icon, "India · Kolkata", "IST · UTC+5:30 · detected", trailing `check_circle`. Then "Choose another city" (search icon, opens city search). Then card "Your time now" ↔ live clock 20sp/600. CTA "Looks right".

**2k Step 2 — first student.** Title "Add your first student". Body "Just the basics. You can add the rest later." Fields: Name; WhatsApp number (country-code dropdown + number); "Where do they live?" (city picker, trailing tz abbreviation + offset, 12sp muted). Live card "Emma's time now" → time 20sp/600 + "Fri · 9h 30m behind you" 12sp. CTAs: Back (secondary) + Next (primary, flex).

**2l Step 3 — weekly classes.** Title "When does {name} have class?" Body "Pick the days and your time. We'll work out hers." Day chips. Dual-time card: two halves split by 1dp divider — "Your time" 8:30 PM (22sp/600) and "{City}" 11:00 AM (22sp/600, muted), each with days 12sp below. Class length segmented: 30 / 45 / 60 min. "Starts" date field. CTA "Go to Today" + caption "Add more students any time from Students." → navigates to Today.

### 2c Today (home) — key screen
- Header: "Friday, 25 Sep" 20sp/600; "Today · 3 classes". Trailing 44dp round add button (white, border, `add` icon teal) → Add student.
- Scrolling list, gap 12dp, in this order:
  1. **DST/timezone notice** (only when upcoming offset change affects a class): bg `#FDF3E2`, border `#F3DDB5`, radius 12dp, `schedule` icon `#9A6512`, text 13sp `#6B470E`: "From 2 Nov, Emma's class moves to 7:30 PM your time."
  2. **Needs attendance** section: card "2 classes from yesterday need attendance." + names/times line; trailing "Mark" → Mark attendance sheet.
  3. **To reschedule** section: card with **dashed** 1dp border `#C9C0AF`: "Noah · Wed class" / "Decided later · asked by student"; trailing "Pick time" → Reschedule.
  4. **Classes** section: one card per class, chronological. Time 20sp/600 (ls −0.2), name 15sp/600, student-local line 13sp muted. Optional status badge top-right (12sp/600, 4×8dp padding, radius 8dp). Two buttons row (gap 8dp, 44dp): **Remind** (primary, brass `notifications` icon `#E9A23B`) and **Reschedule** (secondary).
- Sections with no items are hidden.

### 2j Today — empty day
Left-aligned centered block: 72dp circle `#F6EAD3` with `notifications_paused` 36dp `#C4841F`, rotated −14°. "No classes today. The bell's taking a nap." 18sp/600. "Next up: Aarav, Mon 6:00 PM." 14sp muted.

### 2d Mark attendance (bottom sheet)
Title "6:00 PM · Aarav Mehta" 20sp/600; sub "Thu 24 Sep · 1:30 PM Thu in London". Three option rows (52dp, radius 12dp, 1dp border, gap 8dp): Attended (`check_circle`), Absent (`person_off`, `#D1564B`), Cancelled (`block`, `#8C93A0`). Selected Attended: 2dp `#2E8B57` border, bg `#E3F1E9`, text `#1F5E3B` 600. Optional note textarea (min 72dp, max **140 chars**, counter "46 / 140" right-aligned 12sp). CTA Save.

### 2e Reschedule (full screen)
Top bar 56dp: close icon (48dp touch) + "Reschedule {name}" 18sp/600. "Was Fri 25 Sep, 8:30 PM" 13sp muted. Horizontal date strip: 52×64dp tiles, radius 12dp, day 12sp + date 17sp/600; selected teal fill. Dual-time card (same as 2l) with dates. **Clash warning** (only when overlapping another class or blocked time): bg `#FBE7E5`, text `#8E2F27` 13sp, `warning` icon: "Clashes with Aarav, Sat 6:00–7:00 PM." Non-blocking. "Who asked?" segmented Student / Me. Row "Send new time on WhatsApp?" + switch (default on). Bottom: "Decide later" (secondary — moves class to To reschedule list) + "Move class" (primary).

### 2f Students
Header "Students" + "Add" primary small button (40dp, `add` icon). Rows (gap 8dp): 40dp avatar circle `#DCEAEE` with initial `#1E5F74` 15sp/600; name 15sp/600; "Next · Today 6:00 PM" 13sp muted; trailing student's current local time 14sp/600 + city 12sp muted. Tap → Student details.

### 2g Student details
Top bar: back + overflow (`more_vert`: Edit, Delete). Name 24sp/600; meta "New York · 9:42 AM Fri there · Mon, Wed, Fri · 60 min". Month summary card: 4-column grid — Attended `#1F5E3B`, Moved `#3F2F8F`, Absent `#8E2F27`, Cancelled `#4E5563`; number 20sp/600, label 11sp muted. Upcoming card (time 17sp/600 + local, chevron). Past sessions list: date/time 14sp/600 + status badge, optional note 13sp muted; rows separated by 1dp `#F0EBE1`. Bottom: "Pause student" (secondary) + "Edit schedule" (primary), 48dp.

### 2h Add student
Top bar close + "New student". Fields: Name, WhatsApp number (+code), City (sets timezone, shows "AEST +10:00"), Weekly schedule (day chips + time field showing local conversion "8:00 PM Tue in Sydney" + duration "60 min"), Start date. CTA "Save student".

### 2i Settings
Grouped white cards, 60dp rows with leading teal icon, title 15sp, value 13sp muted, chevron:
- Your timezone — "Kolkata · IST"
- Blocked time — "Daily 1:00–2:30 PM"
- Google Calendar sync — switch (off)
- Reminder message card: brass bell + "Reminder message"; WhatsApp-style bubble bg `#E7F6E4`, radius 12/12/12/4: "Upcoming session today at {time}." (`{time}` highlighted teal 600). Helper "{time} is filled in with the student's local time."
- Theme — System / Light / Dark
- Footer "Signed in as {email}" 12sp muted.

### 3a Dark mode
Same structure. Tokens: bg `#151A22`, surface `#1E2430`, border `#2C3444`, text `#E8ECF2`, muted `#A3ABBA`, primary `#3A8FA8` with text `#0E1A20`, secondary button border `#394254`, nav active pill `#23414C` / `#7EC3D6`, brass `#F0B95E`. Badges: sent `#1D3A2B`/`#8FD4AC`, moved `#2E2752`/`#C3B6F5`.

## Interactions & Behavior
- **Remind** (card button or sheet): opens WhatsApp deep link `https://wa.me/{number}?text={encoded message}` with `{time}` replaced by the student's local class time. On return, mark reminder as sent: badge "Reminder sent" (`#E3F1E9`/`#1F5E3B`), button label → "Remind again". Bell icon plays a **wiggle**: rotate 0 → −18° → 14° → −8° → 4° → 0 over 600ms ease. Snackbar "Reminder sent to {first name} on WhatsApp." (dark `#1D2433`, radius 12dp, 2.2s). When all of today's classes are reminded: "Everyone's been rung."
- **Tap a class card** → bottom sheet with: Send reminder on WhatsApp / Mark attendance / Reschedule.
- **Badges** on class cards: "Reminder sent" (green) takes precedence over "Moved from {Day}" (`#ECE8FA`/`#3F2F8F`).
- **Needs attendance**: classes whose end time has passed with no status. Persist until marked.
- **Decide later** in Reschedule: removes the class from its slot and lists it under To reschedule until a time is picked.
- **Timezones**: store all class times in UTC + student IANA zone + tutor IANA zone. Always render both sides. Detect upcoming DST shifts (next 14 days) and show the notice on Today.
- **Clash detection**: overlap with any other class or blocked time; warn only, never block.
- Touch targets ≥ 44dp. Back button closes sheets first.

## State / Data model (suggested)
- `Tutor { id, email, timezone }`
- `Student { id, name, whatsapp (E.164), city, timezone (IANA), durationMin, schedule: [{weekday, tutorLocalTime}], startDate, paused }`
- `Session { id, studentId, startUtc, durationMin, status: scheduled|attended|absent|cancelled|pendingReschedule, movedFrom?, requestedBy?: student|tutor, reminderSentAt?, note? (≤140) }`
- `Settings { reminderTemplate, blockedTimes[], calendarSync, theme }`
- Sessions are generated from schedules; edits (move/cancel) are stored as overrides.
- Auth: Google Sign-In. Data stays in the user's account (brief: e.g. Firestore or Drive-backed storage).

## Design Tokens (light)
| Token | Hex |
|---|---|
| primary (teal) | `#1E5F74` |
| primary pressed | `#174B5C` |
| primary container | `#DCEAEE` |
| brass (bell accent) | `#E9A23B` |
| background (paper) | `#FAF7F2` |
| surface | `#FFFFFF` |
| border | `#E4DED2` |
| divider (in-card) | `#F0EBE1` |
| dashed border | `#C9C0AF` |
| segmented track | `#EEEAE2` |
| text | `#1D2433` |
| text muted | `#5B6475` |
| success bg / fg | `#E3F1E9` / `#1F5E3B` (stroke `#2E8B57`) |
| moved bg / fg | `#ECE8FA` / `#3F2F8F` |
| error bg / fg | `#FBE7E5` / `#8E2F27` (icon `#D1564B`) |
| notice bg / border / fg | `#FDF3E2` / `#F3DDB5` / `#6B470E` (icon `#9A6512`) |
| cancelled | `#8C93A0`, count `#4E5563` |
| WhatsApp bubble | `#E7F6E4` |

**Typography:** Plus Jakarta Sans (Google Fonts), weights 400 and 600 only. Scale: 30 (sign-in hero) · 24 (screen hero) · 22 (dual time) · 20 (titles, class time) · 18 (top bar) · 17 · 15 (body/names/buttons) · 14 · 13 (secondary) · 12 (labels/badges) · 11 (stat labels). Tabular numerals for all times/numbers.

**Radii:** 4 (progress) · 6 (seg option) · 8 (buttons, badges, seg track) · 12 (inputs, notices, date tiles, snackbar) · 14 (cards) · 20 (sheet top) · full (chips, avatars, switch).

**Spacing:** 4 · 6 · 8 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 40.

**Shadows:** none — separation is by border only.

## Assets
- `assets/logo-icon.svg` — app icon (1a): teal `#1E5F74` rounded tile (rx 12/48) with brass bell. Launcher, Play Store (export 512px PNG).
- `assets/logo-adaptive-foreground.svg` — bell only with safe-zone padding for Android adaptive icon; background layer = solid `#1E5F74`.
- `assets/logo-notification-mono.svg` — white monochrome bell for the status-bar notification icon.
- `assets/wordmark.svg` — icon + "tutor**bell**" (Plus Jakarta Sans 600; "bell" in teal). Convert text to outlines for production.
- Icons: **Material Symbols Rounded** (weight 400, fill 0). Used: today, group, settings, add, notifications, notifications_paused, schedule, my_location, check_circle, search, how_to_reg, event_repeat, person_off, block, close, arrow_back, more_vert, chevron_right, warning, expand_more, public, calendar_month, dark_mode.
- Google logo on sign-in: use official Google Sign-In button asset.

## Files
- `Tutorbell Screens.dc.html` — all screens + logo (open in browser; needs `support.js` beside it). Screen 2c is interactive (Remind, card tap → sheet).
- `support.js` — runtime for the HTML reference only.
- `Tutorbell_Design_Brief.md` — original product brief.
- `assets/` — logo SVGs.
