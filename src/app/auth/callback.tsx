import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth/auth-provider';
import { useProfile } from '@/features/auth/profile';
import { exchangeCodeOnce } from '@/features/auth/google-sign-in';
import { useTheme } from '@/theme/theme-provider';

/**
 * Deep link target after Google sign-in: tutorbell://auth/callback?code=…
 * (or exp://…/--/auth/callback in Expo Go). Exchanges the code, then the root
 * guards send the tutor to onboarding or Today.
 */
export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; error_description?: string }>();
  const { session } = useAuth();
  const profile = useProfile();
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(params.error_description ?? null);

  useEffect(() => {
    if (session || !params.code) return;
    exchangeCodeOnce(params.code).catch((e) =>
      setError(e instanceof Error ? e.message : String(e)),
    );
  }, [params.code, session]);

  // Signed in: go straight to the right place (a guarded route would bounce back here).
  if (session && profile.data) {
    return <Redirect href={profile.data.onboarded_at ? '/' : '/timezone'} />;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
      {!session && (error || !params.code) ? (
        <>
          <Text weight="semibold" className="text-center text-[18px]">
            Couldn't finish signing in
          </Text>
          <Text className="text-center text-[14px] text-muted">
            {error ?? 'No sign-in code was returned.'}
          </Text>
          <Button label="Back to sign in" onPress={() => router.replace('/sign-in')} />
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.primary} />
          <Text className="text-[14px] text-muted">Signing you in…</Text>
        </>
      )}
    </View>
  );
}
