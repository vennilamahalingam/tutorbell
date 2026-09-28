import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createStudent, getStudent, listStudents } from './api';

export const studentKeys = {
  all: ['students'] as const,
  detail: (id: string) => ['students', id] as const,
};

export const useStudents = () => useQuery({ queryKey: studentKeys.all, queryFn: listStudents });

export const useStudent = (id: string) =>
  useQuery({ queryKey: studentKeys.detail(id), queryFn: () => getStudent(id) });

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all }),
  });
}
