import { useSnackbar } from '@/components/ui/snackbar';
import { useProfile } from '@/features/auth/profile';
import type { SessionWithStudent } from '@/features/sessions/api';
import { useMarkReminderSent } from '@/features/sessions/queries';
import { openWhatsAppReminder } from './whatsapp';

const firstName = (name: string) => name.trim().split(/\s+/)[0];

/**
 * Remind flow: open WhatsApp with the reminder (student's local time), mark as sent,
 * then snackbar. When every class today has been reminded: "Everyone's been rung."
 * Returns true if WhatsApp opened (caller plays the bell wiggle).
 */
export function useRemind(todays: SessionWithStudent[] = []) {
  const { data: profile } = useProfile();
  const markSent = useMarkReminderSent();
  const snackbar = useSnackbar();

  return async (session: SessionWithStudent): Promise<boolean> => {
    const name = firstName(session.student.name);
    const opened = await openWhatsAppReminder(session, profile?.reminder_template);
    if (!opened) {
      snackbar(`Add a WhatsApp number for ${name} first.`);
      return false;
    }
    markSent.mutate(session.id);
    const othersPending = todays.some(
      (s) => s.id !== session.id && !s.reminder_sent_at && s.status === 'scheduled',
    );
    snackbar(
      todays.length > 1 && !othersPending
        ? "Everyone's been rung."
        : `Reminder sent to ${name} on WhatsApp.`,
    );
    return true;
  };
}
