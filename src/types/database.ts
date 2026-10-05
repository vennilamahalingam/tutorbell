// Hand-written to match supabase/migrations/0001_init.sql. Once stable, replace with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type SessionStatus =
  'scheduled' | 'attended' | 'absent' | 'cancelled' | 'pending_reschedule';
export type RequestedBy = 'student' | 'tutor';
export type ThemePreference = 'system' | 'light' | 'dark';

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
  city: string | null;
  reminder_template: string;
  theme: ThemePreference;
  calendar_sync: boolean;
  onboarded_at: string | null;
  created_at: string;
};

export type BlockedTime = {
  id: string;
  tutor_id: string;
  weekdays: number[];
  starts: string; // 'HH:MM:SS' tutor-local
  ends: string;
};

export type Student = {
  id: string;
  tutor_id: string;
  name: string;
  whatsapp_number: string | null;
  city: string;
  country: string | null;
  timezone: string;
  duration_minutes: number;
  schedule_weekdays: number[]; // student's week, ISO 1–7
  schedule_time: string | null; // 'HH:MM:SS' student-local
  start_date: string; // 'YYYY-MM-DD' student-local
  paused: boolean;
  created_at: string;
};

export type Session = {
  id: string;
  tutor_id: string;
  student_id: string;
  slot_at: string;
  starts_at: string | null;
  duration_minutes: number;
  status: SessionStatus;
  moved_from: string | null;
  requested_by: RequestedBy | null;
  reminder_sent_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, 'id'>;
      blocked_times: Table<BlockedTime, 'starts' | 'ends'>;
      students: Table<Student, 'name' | 'city' | 'timezone'>;
      sessions: Table<Session, 'student_id' | 'slot_at' | 'duration_minutes'>;
    };
    Views: { [_ in never]: never };
    Functions: {
      generate_sessions: { Args: { p_student_id: string; weeks_ahead?: number }; Returns: number };
      ensure_sessions: { Args: { weeks_ahead?: number }; Returns: number };
      reset_future_sessions: { Args: { p_student_id: string }; Returns: number };
    };
    Enums: { session_status: SessionStatus; requested_by: RequestedBy };
    CompositeTypes: { [_ in never]: never };
  };
};
