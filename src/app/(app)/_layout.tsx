import { Stack } from 'expo-router/stack';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="students/new" options={{ title: 'New student', presentation: 'modal' }} />
      <Stack.Screen name="students/[id]" options={{ title: 'Student' }} />
    </Stack>
  );
}
