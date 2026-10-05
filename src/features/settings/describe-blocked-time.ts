import { DateTime } from 'luxon';

import { formatWeekdays } from '@/lib/time';
import type { BlockedTime } from '@/types/database';

/** 'HH:MM:SS' → '1:00 PM' (drops ':00' minutes only in ranges for brevity). */
const fmt = (t: string) => DateTime.fromFormat(t.slice(0, 5), 'HH:mm').toFormat('h:mm a');

/** "Daily 1:00–2:30 PM" / "Mon, Wed 6:00–7:00 PM" */
export function describeBlockedTime(b: Pick<BlockedTime, 'weekdays' | 'starts' | 'ends'>) {
  const days = b.weekdays.length === 7 ? 'Daily' : formatWeekdays(b.weekdays);
  const [s, e] = [fmt(b.starts), fmt(b.ends)];
  const sameHalf = s.slice(-2) === e.slice(-2);
  return `${days} ${sameHalf ? s.slice(0, -3) : s}–${e}`;
}
