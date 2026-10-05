import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sessionKeys } from '@/features/sessions/queries';
import {
  createStudent,
  deleteStudent,
  getStudent,
  listStudents,
  updateStudent,
  type StudentUpdate,
} from './api';

export const studentKeys = {
  all: ['students'] as const,
  detail: (id: string) => ['students', id] as const,
};

export const useStudents = () => useQuery({ queryKey: studentKeys.all, queryFn: listStudents });

export const useStudent = (id: string) =>
  useQuery({ queryKey: studentKeys.detail(id), queryFn: () => getStudent(id) });

function useInvalidateAll() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: studentKeys.all }),
      qc.invalidateQueries({ queryKey: sessionKeys.all }),
    ]);
}

export function useCreateStudent() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: createStudent, onSuccess: invalidate });
}

export function useUpdateStudent() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: StudentUpdate }) => updateStudent(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteStudent() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: deleteStudent, onSuccess: invalidate });
}
