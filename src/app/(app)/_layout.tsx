import { Stack } from 'expo-router/stack';

import { useEnsureSessions } from '@/features/sessions/queries';

export default function AppLayout() {
  // Generate the next 8 weeks of weekly classes on every app open.
  useEnsureSessions(true);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="students/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="students/[id]" />
      <Stack.Screen name="sessions/[id]/reschedule" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
