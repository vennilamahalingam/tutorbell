import { DateTime } from 'luxon';

/**
 * All session times are stored in UTC (timestamptz) and converted at the edges:
 * - the tutor sees times in their own zone
 * - reminders show the time in the student's zone
 * Luxon handles DST using IANA zone names (e.g. 'Asia/Kolkata', 'America/New_York').
 */

export const deviceZone = (): string => DateTime.local().zoneName ?? 'UTC';

/** UTC ISO bounds for "today" in the given zone, for querying the day's sessions. */
export function dayRangeUtc(zone: string, day: DateTime = DateTime.now()) {
  const local = day.setZone(zone);
  return {
    from: local.startOf('day').toUTC().toISO()!,
    to: local.endOf('day').toUTC().toISO()!,
  };
}

export function formatTime(isoUtc: string, zone: string): string {
  return DateTime.fromISO(isoUtc, { zone: 'utc' }).setZone(zone).toFormat('h:mm a');
}

export function formatDateTime(isoUtc: string, zone: string): string {
  return DateTime.fromISO(isoUtc, { zone: 'utc' }).setZone(zone).toFormat('ccc d LLL, h:mm a');
}

/** Convert a wall-clock time the tutor picked in `zone` to a UTC ISO string for storage. */
export function toUtcIso(
  local: { year: number; month: number; day: number; hour: number; minute: number },
  zone: string,
): string {
  return DateTime.fromObject(local, { zone }).toUTC().toISO()!;
}

export const isValidZone = (zone: string): boolean => DateTime.local().setZone(zone).isValid;

/**
 * Date pickers return a JS Date in the device's zone. We only care about the wall-clock
 * values the tutor picked (e.g. 5:30 PM on 6 Oct) and interpret them in the tutor's zone.
 */
export function pickerDateToUtcIso(date: Date, zone: string): string {
  return toUtcIso(
    {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    },
    zone,
  );
}

/** Inverse of pickerDateToUtcIso: a JS Date whose local wall clock matches `isoUtc` in `zone`. */
export function utcIsoToPickerDate(isoUtc: string, zone: string): Date {
  const dt = DateTime.fromISO(isoUtc, { zone: 'utc' }).setZone(zone);
  return new Date(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute);
}

/** Next full hour from now, as a picker Date — a sensible default for a new class. */
export function nextHourPickerDate(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
}
