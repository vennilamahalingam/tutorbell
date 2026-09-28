import { Linking } from 'react-native';

import { formatTime } from '@/lib/time';
import type { SessionWithStudent } from '@/features/sessions/api';

/** Reminder text, with the class time shown in the student's own timezone. */
export function reminderMessage(session: SessionWithStudent): string {
  const time = session.starts_at ? formatTime(session.starts_at, session.student.timezone) : '';
  return `Hi ${session.student.name}! Just a reminder about our session today at ${time} (your time). See you soon!`;
}

/** Opens WhatsApp with the message pre-filled; the tutor taps send. */
export async function openWhatsAppReminder(session: SessionWithStudent): Promise<boolean> {
  const phone = session.student.whatsapp_number?.replace(/[^\d]/g, '');
  if (!phone) return false;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(reminderMessage(session))}`;
  await Linking.openURL(url);
  return true;
}
