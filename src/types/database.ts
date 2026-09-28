// Hand-written to match supabase/migrations. Once the Supabase project exists, replace with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type SessionStatus = 'scheduled' | 'attended' | 'absent' | 'to_reschedule' | 'cancelled';

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Profile = {
  id: string;
  full_name: string | null;
  timezone: string;
  created_at: string;
};

export type Student = {
  id: string;
  tutor_id: string;
  name: string;
  whatsapp_number: string | null;
  timezone: string;
  default_duration_minutes: number;
  notes: string | null;
  archived: boolean;
  created_at: string;
};

export type Session = {
  id: string;
  tutor_id: string;
  student_id: string;
  starts_at: string | null;
  duration_minutes: number;
  status: SessionStatus;
  original_starts_at: string | null;
  note: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, 'id'>;
      students: Table<Student, 'name' | 'timezone'>;
      sessions: Table<Session, 'student_id'>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { session_status: SessionStatus };
    CompositeTypes: { [_ in never]: never };
  };
};
