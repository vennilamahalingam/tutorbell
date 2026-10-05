import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useTutorZone } from '@/features/auth/profile';
import { relativeDayTime } from '@/features/sessions/insights';
import { useUpcoming } from '@/features/sessions/queries';
import { useStudents } from '@/features/students/queries';
import { nowIn } from '@/lib/time';
import { useNow } from '@/lib/use-now';

/** 2f — Students. */
export default function StudentsScreen() {
  const { data: students = [], isLoading, refetch, isRefetching } = useStudents();
  const { data: upcoming = [] } = useUpcoming();
  const zone = useTutorZone();
  useNow();

  // Earliest upcoming class per student (list is sorted by time).
  const next = new Map<string, string>();
  for (const s of upcoming)
    if (s.starts_at && !next.has(s.student_id)) next.set(s.student_id, s.starts_at);

  return (
    <Screen>
      <ScreenHeader
        title="Students"
        trailing={
          <Button size="sm" label="Add" icon="add" onPress={() => router.push('/students/new')} />
        }
      />
      <FlatList
        data={students}
        keyExtractor={(s) => s.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerClassName="gap-2 px-4 pb-6"
        ListEmptyComponent={
          isLoading ? null : (
            <Text className="px-1 py-6 text-[14px] text-muted">
              No students yet. Tap Add to bring one in.
            </Text>
          )
        }
        renderItem={({ item }) => {
          const local = nowIn(item.timezone);
          const nextAt = next.get(item.id);
          return (
            <Card
              row
              onPress={() => router.push({ pathname: '/students/[id]', params: { id: item.id } })}
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-container">
                  <Text weight="semibold" className="text-[15px] text-on-primary-container">
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text weight="semibold" className="text-[15px]" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text tabular className="text-[13px] text-muted" numberOfLines={1}>
                    {item.paused
                      ? 'Paused'
                      : nextAt
                        ? `Next · ${relativeDayTime(nextAt, zone)}`
                        : 'No classes in the next 2 weeks'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text weight="semibold" tabular className="text-[14px]">
                    {local.time}
                  </Text>
                  <Text className="text-[12px] text-muted">{item.city}</Text>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}
