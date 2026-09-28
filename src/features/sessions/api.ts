import { dayRangeUtc } from '@/lib/time';
import { supabase } from '@/lib/supabase';
import type { Session, SessionStatus, Student } from '@/types/database';

export type SessionWithStudent = Session & {
  student: Pick<Student, 'id' | 'name' | 'timezone' | 'whatsapp_number'>;
};

const withStudent = '*, student:students(id, name, timezone, whatsapp_number)';

export async function listSessionsForDay(tutorZone: string): Promise<SessionWithStudent[]> {
  const { from, to } = dayRangeUtc(tutorZone);
  const { data, error } = await supabase
    .from('sessions')
    .select(withStudent)
    .gte('starts_at', from)
    .lte('starts_at', to)
    .neq('status', 'cancelled')
    .order('starts_at');
  if (error) throw error;
  return data as unknown as SessionWithStudent[];
}

export async function listToReschedule(): Promise<SessionWithStudent[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(withStudent)
    .eq('status', 'to_reschedule')
    .order('original_starts_at');
  if (error) throw error;
  return data as unknown as SessionWithStudent[];
}

export async function setStatus(id: string, status: SessionStatus) {
  const { error } = await supabase.from('sessions').update({ status }).eq('id', id);
  if (error) throw error;
}

/** Move a session to a new time, or pass `null` for "Decide later". */
export async function reschedule(session: Session, newStartsAt: string | null) {
  const { error } = await supabase
    .from('sessions')
    .update({
      starts_at: newStartsAt,
      status: newStartsAt ? 'scheduled' : 'to_reschedule',
      original_starts_at: session.original_starts_at ?? session.starts_at,
    })
    .eq('id', session.id);
  if (error) throw error;
}

export async function saveNote(id: string, note: string) {
  const { error } = await supabase.from('sessions').update({ note }).eq('id', id);
  if (error) throw error;
}

export async function markReminderSent(id: string) {
  const { error } = await supabase
    .from('sessions')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
