import { useQuery } from '@tanstack/react-query';

import { deviceZone } from '@/lib/time';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-provider';

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

/** Tutor's timezone from their profile, falling back to the device zone. */
export const useTutorZone = () => useProfile().data?.timezone ?? deviceZone();
