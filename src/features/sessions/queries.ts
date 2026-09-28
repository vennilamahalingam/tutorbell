import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Session, SessionStatus } from '@/types/database';
import {
  listSessionsForDay,
  listToReschedule,
  markReminderSent,
  reschedule,
  saveNote,
  setStatus,
} from './api';

export const sessionKeys = {
  all: ['sessions'] as const,
  day: (zone: string) => ['sessions', 'day', zone] as const,
  toReschedule: ['sessions', 'to-reschedule'] as const,
};

export const useTodaySessions = (tutorZone: string) =>
  useQuery({ queryKey: sessionKeys.day(tutorZone), queryFn: () => listSessionsForDay(tutorZone) });

export const useToReschedule = () =>
  useQuery({ queryKey: sessionKeys.toReschedule, queryFn: listToReschedule });

function useSessionMutation<T>(fn: (vars: T) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
  });
}

export const useSetStatus = () =>
  useSessionMutation(({ id, status }: { id: string; status: SessionStatus }) =>
    setStatus(id, status),
  );

export const useReschedule = () =>
  useSessionMutation(({ session, startsAt }: { session: Session; startsAt: string | null }) =>
    reschedule(session, startsAt),
  );

export const useSaveNote = () =>
  useSessionMutation(({ id, note }: { id: string; note: string }) => saveNote(id, note));

export const useMarkReminderSent = () => useSessionMutation((id: string) => markReminderSent(id));
