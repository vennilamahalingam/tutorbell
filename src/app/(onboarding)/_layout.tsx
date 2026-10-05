import { Stack } from 'expo-router/stack';

import { OnboardingProvider } from '@/features/onboarding/onboarding-context';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="timezone" />
        <Stack.Screen name="student" />
        <Stack.Screen name="schedule" />
      </Stack>
    </OnboardingProvider>
  );
}
