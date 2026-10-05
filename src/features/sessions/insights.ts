import { DateTime } from 'luxon';

import type { BadgeTone } from '@/components/ui/badge';
import type { BlockedTime, Session } from '@/types/database';
import type { SessionWithStudent } from './api';

const local = (iso: string, zone: string) => DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone);
const firstName = (name: string) => name.trim().split(/\s+/)[0];

/** "Today 6:00 PM" · "Tomorrow 6:00 PM" · "Mon 6:00 PM" · "Mon 12 Oct, 6:00 PM" */
export function relativeDayTime(iso: string, zone: string, now = DateTime.now()) {
  const dt = local(iso, zone);
  const days = Math.round(dt.startOf('day').diff(now.setZone(zone).startOf('day'), 'days').days);
  const time = dt.toFormat('h:mm a');
  if (days === 0) return `Today ${time}`;
  if (days === 1) return `Tomorrow ${time}`;
  if (days > 1 && days < 7) return `${dt.toFormat('ccc')} ${time}`;
  return dt.toFormat('ccc d LLL, h:mm a');
}

/**
 * Daylight-saving heads-up (design: "From 2 Nov, Emma's class moves to 7:30 PM your time.").
 * Weekly classes are fixed in the student's time, so when either side's clocks change the
 * tutor-side time moves. Looks at upcoming untouched classes (next 14 days) per student.
 */
export function upcomingTimeShifts(upcoming: SessionWithStudent[], tutorZone: string) {
  const byStudent = new Map<string, SessionWithStudent[]>();
  for (const s of upcoming) {
    if (s.moved_from || !s.starts_at) continue;
    byStudent.set(s.student_id, [...(byStudent.get(s.student_id) ?? []), s]);
  }
  const notices: { key: string; message: string }[] = [];
  for (const [studentId, list] of byStudent) {
    const sorted = [...list].sort((a, b) => a.starts_at!.localeCompare(b.starts_at!));
    const firstTime = local(sorted[0].starts_at!, tutorZone).toFormat('h:mm a');
    const changed = sorted.find(
      (s) => local(s.starts_at!, tutorZone).toFormat('h:mm a') !== firstTime,
    );
    if (changed) {
      const dt = local(changed.starts_at!, tutorZone);
      notices.push({
        key: studentId,
        message: `From ${dt.toFormat('d LLL')}, ${firstName(changed.student.name)}'s class moves to ${dt.toFormat('h:mm a')} your time.`,
      });
    }
  }
  return notices;
}

/**
 * Clash check for a proposed slot: overlapping classes (other than `excludeId`) or blocked time.
 * Warn only, never block. Returns design copy: "Clashes with Aarav, Sat 6:00–7:00 PM."
 */
export function findClash(
  startIso: string,
  durationMin: number,
  tutorZone: string,
  sessions: SessionWithStudent[],
  blocked: BlockedTime[],
  excludeId?: string,
): string | null {
  const start = local(startIso, tutorZone);
  const end = start.plus({ minutes: durationMin });

  for (const s of sessions) {
    if (s.id === excludeId || !s.starts_at) continue;
    const sStart = local(s.starts_at, tutorZone);
    const sEnd = sStart.plus({ minutes: s.duration_minutes });
    if (sStart < end && start < sEnd) {
      return `Clashes with ${firstName(s.student.name)}, ${sStart.toFormat('ccc')} ${range(sStart, sEnd)}.`;
    }
  }

  for (const b of blocked) {
    if (!b.weekdays.includes(start.weekday)) continue;
    const [sh, sm] = b.starts.split(':').map(Number);
    const [eh, em] = b.ends.split(':').map(Number);
    const bStart = start.set({ hour: sh, minute: sm, second: 0 });
    const bEnd = start.set({ hour: eh, minute: em, second: 0 });
    if (bStart < end && start < bEnd) {
      return `Clashes with your blocked time, ${range(bStart, bEnd)}.`;
    }
  }
  return null;
}

/** "6:00–7:00 PM" or "11:30 AM–12:30 PM" */
function range(a: DateTime, b: DateTime) {
  const same = a.toFormat('a') === b.toFormat('a');
  return `${a.toFormat(same ? 'h:mm' : 'h:mm a')}–${b.toFormat('h:mm a')}`;
}

/** Badge shown on a class card / past session row, if any. */
export function sessionBadge(
  s: Session,
  tutorZone: string,
): { label: string; tone: BadgeTone } | null {
  switch (s.status) {
    case 'attended':
      return { label: 'Attended', tone: 'success' };
    case 'absent':
      return { label: 'Absent', tone: 'error' };
    case 'cancelled':
      return { label: 'Cancelled', tone: 'cancel' };
    case 'pending_reschedule':
      return { label: 'To reschedule', tone: 'moved' };
  }
  // Design: "Reminder sent" takes precedence over "Moved from {Day}".
  if (s.reminder_sent_at) return { label: 'Reminder sent', tone: 'success' };
  if (s.moved_from)
    return { label: `Moved from ${local(s.moved_from, tutorZone).toFormat('ccc')}`, tone: 'moved' };
  return null;
}

/** Month summary for student details: Attended · Moved · Absent · Cancelled. */
export function monthSummary(
  sessions: Session[],
  tutorZone: string,
  month = DateTime.now().setZone(tutorZone),
) {
  const inMonth = sessions.filter((s) => local(s.slot_at, tutorZone).hasSame(month, 'month'));
  return {
    label: month.toFormat('LLLL'),
    attended: inMonth.filter((s) => s.status === 'attended').length,
    moved: inMonth.filter((s) => s.moved_from).length,
    absent: inMonth.filter((s) => s.status === 'absent').length,
    cancelled: inMonth.filter((s) => s.status === 'cancelled').length,
  };
}

/** Plain-words summary of who still needs attendance: "2 classes from yesterday need attendance." */
export function needsAttendanceTitle(list: SessionWithStudent[], tutorZone: string) {
  const n = list.length;
  const today = DateTime.now().setZone(tutorZone).startOf('day');
  const dayDiffs = new Set(
    list.map((s) =>
      Math.round(today.diff(local(s.starts_at!, tutorZone).startOf('day'), 'days').days),
    ),
  );
  const when =
    dayDiffs.size === 1
      ? (({ 0: ' from today', 1: ' from yesterday' } as Record<number, string>)[[...dayDiffs][0]] ??
        '')
      : '';
  return `${n} ${n === 1 ? 'class' : 'classes'}${when} ${n === 1 ? 'needs' : 'need'} attendance.`;
}
