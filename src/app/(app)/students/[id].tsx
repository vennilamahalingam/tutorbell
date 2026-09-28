import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { useStudent } from '@/features/students/queries';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student } = useStudent(id);

  return (
    <View className="flex-1 gap-2 bg-surface-muted p-4">
      <Stack.Screen options={{ title: student?.name ?? 'Student' }} />
      <Text className="text-ink">Timezone: {student?.timezone}</Text>
      <Text className="text-ink">WhatsApp: {student?.whatsapp_number ?? '—'}</Text>
      {student?.notes ? <Text className="text-ink-muted">{student.notes}</Text> : null}
      {/* TODO: upcoming sessions, schedule a class, session notes */}
    </View>
  );
}
