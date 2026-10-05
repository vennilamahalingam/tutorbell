import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useTutorZone } from '@/features/auth/profile';
import { useStudentSessions } from '@/features/sessions/queries';
import { useStudent } from '@/features/students/queries';
import { formatDateTime } from '@/lib/time';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student } = useStudent(id);
  const { data: sessions = [], isLoading } = useStudentSessions(id);
  const tutorZone = useTutorZone();

  return (
    <View className="flex-1 bg-surface-muted p-4">
      <Stack.Screen options={{ title: student?.name ?? 'Student' }} />
      <View className="gap-1 rounded-2xl bg-surface p-4">
        <Text className="text-ink">Timezone: {student?.timezone}</Text>
        <Text className="text-ink">WhatsApp: {student?.whatsapp_number ?? '—'}</Text>
        {student?.notes ? <Text className="text-ink-muted">{student.notes}</Text> : null}
      </View>

      <Text className="mb-2 mt-6 text-lg font-semibold text-ink">Upcoming classes</Text>
      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        contentContainerClassName="gap-2 pb-4"
        ListEmptyComponent={
          isLoading ? null : <Text className="text-ink-muted">No classes scheduled yet.</Text>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/sessions/[id]/reschedule', params: { id: item.id } }} asChild>
            <Pressable className="flex-row justify-between rounded-xl bg-surface p-4 active:opacity-80">
              <Text className="text-ink">
                {item.starts_at && formatDateTime(item.starts_at, tutorZone)}
              </Text>
              <Text className="text-ink-muted">{item.duration_minutes} min</Text>
            </Pressable>
          </Link>
        )}
      />
      <View className="pb-4">
        <Button
          label="Add class"
          onPress={() => router.push({ pathname: '/sessions/new', params: { studentId: id } })}
        />
      </View>
    </View>
  );
}
