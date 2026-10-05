import { supabase } from '@/lib/supabase';
import type { Database, Student } from '@/types/database';

export type NewStudent = Database['public']['Tables']['students']['Insert'];
export type StudentUpdate = Database['public']['Tables']['students']['Update'];

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from('students').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function getStudent(id: string): Promise<Student> {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

/** Creates the student and generates their upcoming weekly classes. */
export async function createStudent(input: NewStudent): Promise<Student> {
  const { data, error } = await supabase.from('students').insert(input).select().single();
  if (error) throw error;
  const { error: genError } = await supabase.rpc('generate_sessions', { p_student_id: data.id });
  if (genError) throw genError;
  return data;
}

/**
 * Updates a student. If the schedule, length or pause state changed, future untouched
 * classes are rebuilt (moved / marked / reminded classes are kept).
 */
export async function updateStudent(id: string, patch: StudentUpdate): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  const scheduleKeys: (keyof StudentUpdate)[] = [
    'schedule_weekdays',
    'schedule_time',
    'start_date',
    'duration_minutes',
    'timezone',
    'paused',
  ];
  if (scheduleKeys.some((k) => k in patch)) {
    const { error: e } = await supabase.rpc('reset_future_sessions', { p_student_id: id });
    if (e) throw e;
  }
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}
