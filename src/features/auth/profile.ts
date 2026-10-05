import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deviceZone } from '@/lib/time';
import { supabase } from '@/lib/supabase';
import type { Database, Profile } from '@/types/database';
import { useAuth } from './auth-provider';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const profileKey = (userId: string | undefined) => ['profile', userId] as const;

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: profileKey(userId),
    enabled: !!userId,
    queryFn: async (): Promise<Profile> => {
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

export function useUpdateProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: ProfileUpdate) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => qc.setQueryData(profileKey(userId), data),
  });
}

/** Tutor's timezone. Until onboarding saves one, use the phone's zone. */
export function useTutorZone() {
  const { data } = useProfile();
  return data?.onboarded_at ? data.timezone : deviceZone();
}
