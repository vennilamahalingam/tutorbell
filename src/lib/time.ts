import { DateTime } from 'luxon';

/**
 * Time rules (design/README.md → "Timezones"):
 * - Class times are stored in UTC; zones are IANA names.
 * - The tutor's time is always primary; the student's time is secondary and always
 *   includes the day: "1:30 PM Fri in London".
 * - A weekly schedule is stored in the STUDENT's local time, so it stays put for them
 *   across daylight-saving changes (the tutor's time moves instead).
 */

// Old IANA names some phones still report → current names.
const ZONE_ALIASES: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Asia/Rangoon': 'Asia/Yangon',
  'Europe/Kiev': 'Europe/Kyiv',
  'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
  'Australia/ACT': 'Australia/Sydney',
  'Australia/NSW': 'Australia/Sydney',
  'US/Eastern': 'America/New_York',
  'US/Central': 'America/Chicago',
  'US/Mountain': 'America/Denver',
  'US/Pacific': 'America/Los_Angeles',
};
export const normalizeZone = (zone: string) => ZONE_ALIASES[zone] ?? zone;

export const deviceZone = (): string => normalizeZone(DateTime.local().zoneName ?? 'UTC');

export const isValidZone = (zone: string): boolean => DateTime.local().setZone(zone).isValid;

const utc = (iso: string) => DateTime.fromISO(iso, { zone: 'utc' });

// ─── Formatting ────────────────────────────────────────────────────────────────

/** "8:30 PM" */
export const formatTime = (iso: string, zone: string) => utc(iso).setZone(zone).toFormat('h:mm a');

/** "Fri 25 Sep, 8:30 PM" */
export const formatDateTime = (iso: string, zone: string) =>
  utc(iso).setZone(zone).toFormat('ccc d LLL, h:mm a');

/** Student-side line: "1:30 PM Fri in London" */
export const formatStudentLocal = (iso: string, zone: string, city: string) =>
  `${utc(iso).setZone(zone).toFormat('h:mm a ccc')} in ${city}`;

// Intl only gives friendly abbreviations (IST, BST, AEST) in the matching locale.
const ABBR_LOCALE: [RegExp, string][] = [
  [/^Asia\/Kolkata$/, 'en-IN'],
  [/^Europe\/(London|Dublin)$/, 'en-GB'],
  [/^Australia\//, 'en-AU'],
  [/^Pacific\/Auckland$/, 'en-NZ'],
  [/^America\/(Toronto|Winnipeg|Edmonton|Vancouver|Halifax)$/, 'en-CA'],
  [/^(America|Pacific\/Honolulu)/, 'en-US'],
];

/** Short zone name: "IST", "BST", "EDT", "AEST" — or "GMT+4" where there's no common one. */
export function zoneAbbr(zone: string, at: DateTime = DateTime.now()) {
  const locale = ABBR_LOCALE.find(([re]) => re.test(zone))?.[1] ?? 'en-US';
  return at.setZone(zone).setLocale(locale).offsetNameShort ?? at.setZone(zone).toFormat('ZZ');
}

/** { abbr: 'IST', offset: 'UTC+5:30' } */
export function zoneLabels(zone: string, at: DateTime = DateTime.now()) {
  const dt = at.setZone(zone);
  return { abbr: zoneAbbr(zone, at), offset: `UTC${dt.toFormat('Z')}` };
}

/** "AEST +10:00" — shown at the end of the city field. */
export function zoneShort(zone: string) {
  const dt = DateTime.now().setZone(zone);
  return `${zoneAbbr(zone, dt)} ${dt.toFormat('ZZ')}`;
}

/** "9h 30m behind you" / "5h ahead of you" / "Same time as you" */
export function offsetFromTutor(studentZone: string, tutorZone: string, at = DateTime.now()) {
  const diff = at.setZone(studentZone).offset - at.setZone(tutorZone).offset; // minutes
  if (diff === 0) return 'Same time as you';
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const amount = [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ');
  return `${amount} ${diff < 0 ? 'behind' : 'ahead of'} you`;
}

/** Live "now" in a zone: { time: '9:42 AM', day: 'Fri' } */
export function nowIn(zone: string) {
  const dt = DateTime.now().setZone(zone);
  return { time: dt.toFormat('h:mm a'), day: dt.toFormat('ccc') };
}

// ─── Day ranges ────────────────────────────────────────────────────────────────

/** UTC ISO bounds for a calendar day in `zone` (default: today). */
export function dayRangeUtc(zone: string, day: DateTime = DateTime.now()) {
  const local = day.setZone(zone);
  return {
    from: local.startOf('day').toUTC().toISO()!,
    to: local.endOf('day').toUTC().toISO()!,
  };
}

// ─── Wall-clock helpers (pickers give JS Dates in the device zone) ─────────────

export type WallTime = { hour: number; minute: number };

export const wallTimeFromDate = (d: Date): WallTime => ({
  hour: d.getHours(),
  minute: d.getMinutes(),
});
export const dateFromWallTime = ({ hour, minute }: WallTime) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
};
export const formatWallTime = ({ hour, minute }: WallTime) =>
  DateTime.fromObject({ hour, minute }).toFormat('h:mm a');

/** 'YYYY-MM-DD' for a JS Date's local calendar day. */
export const isoDate = (d: Date) => DateTime.fromJSDate(d).toISODate()!;

/** Wall clock picked by the tutor, interpreted in `zone`, as UTC ISO. */
export function pickerDateToUtcIso(date: Date, zone: string): string {
  return DateTime.fromObject(
    {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    },
    { zone },
  )
    .toUTC()
    .toISO()!;
}

// ─── Weekly schedules ──────────────────────────────────────────────────────────

/** Schedule as stored on the student: their weekdays + their local time + start date. */
export type StudentSchedule = {
  weekdays: number[]; // ISO 1–7, student's week
  time: string; // 'HH:mm:ss', student-local
  startDate: string; // 'YYYY-MM-DD', student-local
};

/**
 * Converts what the tutor picked ("Mon, Wed at 8:30 PM my time, starting 29 Sep") into the
 * student's schedule. Uses the first week from the start date, so the conversion reflects
 * the offset in effect when classes begin. Weekdays can shift (8:30 AM Mon in Kolkata is
 * 11:00 PM Sun in New York) — that's handled per day.
 */
export function tutorPickToStudentSchedule(
  pick: { weekdays: number[]; time: WallTime; startDate: string },
  tutorZone: string,
  studentZone: string,
): StudentSchedule {
  const start = DateTime.fromISO(pick.startDate, { zone: tutorZone }).startOf('day');
  const occurrences = pick.weekdays.map((wd) => {
    const daysAhead = (wd - start.weekday + 7) % 7;
    return start.plus({ days: daysAhead }).set({ hour: pick.time.hour, minute: pick.time.minute });
  });
  const inStudent = occurrences
    .map((o) => o.setZone(studentZone))
    .sort((a, b) => a.toMillis() - b.toMillis());
  const first = inStudent[0];
  return {
    weekdays: [...new Set(inStudent.map((o) => o.weekday))].sort(),
    time: first ? first.toFormat('HH:mm:ss') : '00:00:00',
    startDate: first ? first.toISODate()! : pick.startDate,
  };
}

/**
 * Next occurrences of a student's weekly slots (student-local), returned as UTC ISO.
 * Used for previews ("Your time 8:30 PM · Mon, Wed") before anything is saved.
 */
export function nextOccurrences(
  schedule: StudentSchedule,
  studentZone: string,
  count = 7,
): string[] {
  const [hour, minute] = schedule.time.split(':').map(Number);
  const today = DateTime.now().setZone(studentZone).startOf('day');
  let day = DateTime.fromISO(schedule.startDate, { zone: studentZone }).startOf('day');
  if (day < today) day = today;
  const out: string[] = [];
  for (let i = 0; out.length < count && i < 7 * 8; i++) {
    const d = day.plus({ days: i });
    if (schedule.weekdays.includes(d.weekday)) {
      out.push(d.set({ hour, minute }).toUTC().toISO()!);
    }
  }
  return out;
}

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** "Mon, Wed, Fri" for ISO weekdays. */
export const formatWeekdays = (days: number[]) =>
  [...days]
    .sort()
    .map((d) => WEEKDAY_SHORT[d - 1])
    .join(', ');

/** Weekdays of a set of UTC instants as seen in `zone`, e.g. ['Mon','Wed'] → "Mon, Wed". */
export function weekdaysIn(isos: string[], zone: string) {
  return formatWeekdays([...new Set(isos.map((i) => utc(i).setZone(zone).weekday))]);
}
