# Tutorbell — manual test checklist (V1)

Setup: `npm install`, run `supabase/migrations/0001_init.sql` in Supabase (wipes data), `npx expo start -c`.
Tip: test with a student whose WhatsApp number is your own, so reminders come to you.

## Sign in & onboarding
- [ ] Sign in with Google → onboarding step 1
- [ ] Step 1 shows your city (e.g. India · Kolkata, IST · UTC+5:30 · detected); "Choose another city" works
- [ ] Step 2: name, +code picker, city search; "{Name}'s time now" + "… behind/ahead of you" look right
- [ ] Step 3: pick days + your time → right side shows the student's time/days; Go to Today lands on Today
- [ ] Kill and reopen the app → goes straight to Today

## Today
- [ ] Today's classes in time order: your time big, "{time} {Day} in {City}" under the name
- [ ] Remind → WhatsApp opens with "Upcoming session today at {student's time}." → back in app: bell wiggles, "Reminder sent" badge, button says "Remind again", snackbar
- [ ] Remind all of today's classes → "Everyone's been rung."
- [ ] Tap a card → sheet: Send reminder / Mark attendance / Reschedule
- [ ] After a class ends it appears under Needs attendance → Mark steps through each → last one: "Register's all caught up. Chai break?" (when 2+)
- [ ] Reschedule → Decide later → appears under To reschedule (dashed) → Pick time works
- [ ] A day with no classes: "No classes today. The bell's taking a nap." + Next up line
- [ ] Pull to refresh

## Mark attendance
- [ ] Attended / Absent / Cancelled highlight; note counter stops at 140
- [ ] Marked class shows its badge on Today and in student's Past sessions with the note

## Reschedule
- [ ] Date strip scrolls 3 weeks; tap your time to change it; student's time/day updates
- [ ] Pick a time overlapping another class → red "Clashes with …" (still lets you move)
- [ ] Pick a time inside blocked time → "Clashes with your blocked time, …"
- [ ] Move class with WhatsApp switch on → WhatsApp opens with the new time (student's time); snackbar "Done. … now rings on …"
- [ ] Card then shows "Moved from {Day}"

## Students
- [ ] List: avatar initial, "Next · Today/Tomorrow/Thu 6:00 PM", their local time + city
- [ ] Add student (+ on Today or Add on Students) → classes appear on Today/Next
- [ ] Details: meta line, month summary (Attended/Moved/Absent/Cancelled), Upcoming → opens Reschedule, Past sessions with badges + notes
- [ ] Edit schedule → change days/time → upcoming classes rebuild; moved/marked ones stay
- [ ] Pause → "Paused", no upcoming classes; Resume → classes come back
- [ ] ⋮ → Delete → confirm → gone

## Settings
- [ ] Your timezone → pick another city → all times on Today shift; student times stay the same
- [ ] Blocked time: add (days + from/to), delete; row shows "Daily 1:00–2:30 PM"
- [ ] Reminder message: edit, must contain {time}, Reset; next Remind uses new text
- [ ] Theme: System / Light / Dark switch instantly
- [ ] Sign out → back to sign in

## Daylight saving (needs a date near a clock change)
- [ ] With a London/US student and a class after their clock change within 14 days, Today shows
      "From {date}, {Name}'s class moves to {time} your time."
