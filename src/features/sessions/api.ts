import { dayRangeUtc } from '@/lib/time';
import { supabase } from '@/lib/supabase';
import type { RequestedBy, Session, SessionStatus, Student } from '@/types/database';

export type SessionWithStudent = Session & {
  student: Pick<Student, 'id' | 'name' | 'timezone' | 'city' | 'whatsapp_number'>;
};

const withStudent = '*, student:students(id, name, timezone, city, whatsapp_number)';
const cast = <T>(data: unknown) => data as T;

/** Tops up weekly classes for all active students (rolling 8 weeks). Call on app open. */
export async function ensureSessions(): Promise<void> {
  const { error } = await supabase.rpc('ensure_sessions', {});
  if (error) throw error;
}

/** Classes on a calendar day in the tutor's zone (excludes cancelled + decide-later). */
export async function listSessionsForDay(tutorZone: string): Promise<SessionWithStudent[]> {
  const { from, to } = dayRangeUtc(tutorZone);
  const { data, error } = await supabase
    .from('sessions')
    .select(withStudent)
    .gte('starts_at', from)
    .lte('starts_at', to)
    .neq('status', 'cancelled')
    .neq('status', 'pending_reschedule')
    .order('starts_at');
  if (error) throw error;
  return cast<SessionWithStudent[]>(data);
}

/** Classes whose end time has passed with no attendance marked (design: "Needs attendance"). */
export async function listNeedsAttendance(): Promise<SessionWithStudent[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(withStudent)
    .eq('status', 'scheduled')
    .lt('starts_at', new Date().toISOString())
    .order('starts_at');
  if (error) throw error;
  const now = Date.now();
  return cast<SessionWithStudent[]>(data).filter(
    (s) => new Date(s.starts_at!).getTime() + s.duration_minutes * 60_000 <= now,
  );
}

/** "Decide later" classes (design: "To reschedule"). */
export async function listPendingReschedule(): Promise<SessionWithStudent[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(withStudent)
    .eq('status', 'pending_reschedule')
    .order('slot_at');
  if (error) throw error;
  return cast<SessionWithStudent[]>(data);
}

export async function getSession(id: string): Promise<SessionWithStudent> {
  const { data, error } = await supabase.from('sessions').select(withStudent).eq('id', id).single();
  if (error) throw error;
  return cast<SessionWithStudent>(data);
}

export async function listStudentSessions(studentId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('slot_at', { ascending: false })
    .limit(60);
  if (error) throw error;
  return data;
}

/** Sessions in a UTC range — used for clash detection. */
export async function listSessionsBetween(
  fromIso: string,
  toIso: string,
): Promise<SessionWithStudent[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(withStudent)
    .gte('starts_at', fromIso)
    .lte('starts_at', toIso)
    .in('status', ['scheduled', 'attended'])
    .order('starts_at');
  if (error) throw error;
  return cast<SessionWithStudent[]>(data);
}

export async function markAttendance(
  id: string,
  status: Extract<SessionStatus, 'attended' | 'absent' | 'cancelled'>,
  note: string | null,
) {
  const { error } = await supabase
    .from('sessions')
    .update({ status, note: note?.trim() || null })
    .eq('id', id);
  if (error) throw error;
}

/** Move a class to `newStartsAt`, or pass null for "Decide later". */
export async function reschedule(
  session: Session,
  newStartsAt: string | null,
  requestedBy: RequestedBy,
) {
  const { error } = await supabase
    .from('sessions')
    .update({
      starts_at: newStartsAt,
      status: newStartsAt ? 'scheduled' : 'pending_reschedule',
      moved_from: session.starts_at ?? session.moved_from ?? session.slot_at,
      requested_by: requestedBy,
      reminder_sent_at: null,
    })
    .eq('id', session.id);
  if (error) throw error;
}

export async function markReminderSent(id: string) {
  const { error } = await supabase
    .from('sessions')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
