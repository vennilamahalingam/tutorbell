import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useStudents } from '@/features/students/queries';
import { nowIn } from '@/lib/time';
import { useNow } from '@/lib/use-now';

/** Students (2f) — INTERIM: list rows. "Next · …" line comes with the Students rebuild. */
export default function StudentsScreen() {
  const { data: students = [], isLoading } = useStudents();
  useNow();

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
        contentContainerClassName="gap-2 px-4 pb-6"
        ListEmptyComponent={
          isLoading ? null : (
            <Text className="px-1 py-6 text-[14px] text-muted">No students yet.</Text>
          )
        }
        renderItem={({ item }) => {
          const local = nowIn(item.timezone);
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
                  <Text weight="semibold" className="text-[15px]">
                    {item.name}
                  </Text>
                  {item.paused ? <Text className="text-[13px] text-muted">Paused</Text> : null}
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
