import '../global.css';

// Import the two weights directly so only these fonts are bundled (design: regular + semibold).
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router/stack';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { SnackbarProvider } from '@/components/ui/snackbar';
import { Text } from '@/components/ui/text';
import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { signOut } from '@/features/auth/google-sign-in';
import { useProfile } from '@/features/auth/profile';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider, useTheme } from '@/theme/theme-provider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading: authLoading } = useAuth();
  const profile = useProfile();
  const [fontsLoaded] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold });

  const ready = fontsLoaded && !authLoading && (!session || !profile.isLoading);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  const signedIn = !!session;
  const onboarded = !!profile.data?.onboarded_at;

  return (
    <ThemeProvider preference={profile.data?.theme ?? 'system'}>
      <ThemedStatusBar />
      <SnackbarProvider>
        {signedIn && profile.isError ? (
          <ProfileError message={profile.error.message} onRetry={() => profile.refetch()} />
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            {/* Reachable in every state: Google sign-in returns here with ?code= */}
            <Stack.Screen name="auth/callback" />
            <Stack.Protected guard={!signedIn}>
              <Stack.Screen name="sign-in" />
            </Stack.Protected>
            <Stack.Protected guard={signedIn && !onboarded}>
              <Stack.Screen name="(onboarding)" />
            </Stack.Protected>
            <Stack.Protected guard={signedIn && onboarded}>
              <Stack.Screen name="(app)" />
            </Stack.Protected>
          </Stack>
        )}
      </SnackbarProvider>
    </ThemeProvider>
  );
}

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

/** Usually means the database migration hasn't been run yet. */
function ProfileError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="flex-1 justify-center gap-4 bg-bg px-6">
      <Text weight="semibold" className="text-[20px]">
        Couldn't load your account
      </Text>
      <Text className="text-[14px] text-muted">{message}</Text>
      <Button label="Try again" onPress={onRetry} />
      <Button label="Sign out" variant="secondary" onPress={signOut} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
