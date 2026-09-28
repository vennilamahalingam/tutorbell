import { supabase } from '@/lib/supabase';
import type { Database, Student } from '@/types/database';

type NewStudent = Database['public']['Tables']['students']['Insert'];

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('archived', false)
    .order('name');
  if (error) throw error;
  return data;
}

export async function getStudent(id: string): Promise<Student> {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createStudent(input: NewStudent): Promise<Student> {
  const { data, error } = await supabase.from('students').insert(input).select().single();
  if (error) throw error;
  return data;
}
