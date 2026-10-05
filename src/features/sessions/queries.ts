import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { RequestedBy, Session } from '@/types/database';
import {
  ensureSessions,
  getSession,
  listNeedsAttendance,
  listPendingReschedule,
  listSessionsForDay,
  listStudentSessions,
  markAttendance,
  markReminderSent,
  reschedule,
} from './api';

export const sessionKeys = {
  all: ['sessions'] as const,
  day: (zone: string) => ['sessions', 'day', zone] as const,
  needsAttendance: ['sessions', 'needs-attendance'] as const,
  pending: ['sessions', 'pending-reschedule'] as const,
  detail: (id: string) => ['sessions', 'detail', id] as const,
  student: (studentId: string) => ['sessions', 'student', studentId] as const,
};

/** Runs once per app open: generates upcoming weekly classes, then refreshes lists. */
export function useEnsureSessions(enabled: boolean) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['ensure-sessions'],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      await ensureSessions();
      await qc.invalidateQueries({ queryKey: sessionKeys.all });
      return true;
    },
  });
}

export const useTodaySessions = (tutorZone: string) =>
  useQuery({ queryKey: sessionKeys.day(tutorZone), queryFn: () => listSessionsForDay(tutorZone) });

export const useNeedsAttendance = () =>
  useQuery({ queryKey: sessionKeys.needsAttendance, queryFn: listNeedsAttendance });

export const usePendingReschedule = () =>
  useQuery({ queryKey: sessionKeys.pending, queryFn: listPendingReschedule });

export const useSession = (id: string) =>
  useQuery({ queryKey: sessionKeys.detail(id), queryFn: () => getSession(id) });

export const useStudentSessions = (studentId: string) =>
  useQuery({
    queryKey: sessionKeys.student(studentId),
    queryFn: () => listStudentSessions(studentId),
  });

function useSessionMutation<T>(fn: (vars: T) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
  });
}

export const useMarkAttendance = () =>
  useSessionMutation(
    (v: { id: string; status: 'attended' | 'absent' | 'cancelled'; note: string | null }) =>
      markAttendance(v.id, v.status, v.note),
  );

export const useReschedule = () =>
  useSessionMutation((v: { session: Session; startsAt: string | null; requestedBy: RequestedBy }) =>
    reschedule(v.session, v.startsAt, v.requestedBy),
  );

export const useMarkReminderSent = () => useSessionMutation((id: string) => markReminderSent(id));
