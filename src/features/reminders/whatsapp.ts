import { Linking } from 'react-native';

import type { SessionWithStudent } from '@/features/sessions/api';
import { formatTime } from '@/lib/time';

export const DEFAULT_TEMPLATE = 'Upcoming session today at {time}.';

/** Fills {time} with the class time in the STUDENT's timezone. */
export function reminderMessage(session: SessionWithStudent, template = DEFAULT_TEMPLATE): string {
  const time = session.starts_at ? formatTime(session.starts_at, session.student.timezone) : '';
  return template.replaceAll('{time}', time);
}

/** Opens WhatsApp with the message pre-filled; the tutor taps send. Returns false if no number. */
export async function openWhatsApp(
  phone: string | null | undefined,
  message: string,
): Promise<boolean> {
  const digits = phone?.replace(/[^\d]/g, '');
  if (!digits) return false;
  await Linking.openURL(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`);
  return true;
}

export const openWhatsAppReminder = (session: SessionWithStudent, template?: string) =>
  openWhatsApp(session.student.whatsapp_number, reminderMessage(session, template));
