import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { BlockedTime, Database } from '@/types/database';

type NewBlockedTime = Database['public']['Tables']['blocked_times']['Insert'];
const key = ['blocked-times'] as const;

export function useBlockedTimes() {
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<BlockedTime[]> => {
      const { data, error } = await supabase.from('blocked_times').select('*').order('starts');
      if (error) throw error;
      return data;
    },
  });
}

export function useAddBlockedTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewBlockedTime) => {
      const { error } = await supabase.from('blocked_times').insert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteBlockedTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blocked_times').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export { describeBlockedTime } from './describe-blocked-time';
