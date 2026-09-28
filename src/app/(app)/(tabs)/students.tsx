import { Link } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useStudents } from '@/features/students/queries';
import { router } from 'expo-router';

export default function StudentsScreen() {
  const { data: students = [], isLoading } = useStudents();

  return (
    <Screen>
      <Text className="mb-4 text-2xl font-bold text-ink">Students</Text>
      <FlatList
        data={students}
        keyExtractor={(s) => s.id}
        contentContainerClassName="gap-2 pb-6 grow"
        ListEmptyComponent={
          isLoading ? null : <EmptyState title="No students yet" body="Add your first one below." />
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/students/[id]', params: { id: item.id } }} asChild>
            <Pressable className="rounded-2xl bg-surface p-4 active:opacity-80">
              <Text className="font-semibold text-ink">{item.name}</Text>
              <Text className="text-sm text-ink-muted">{item.timezone}</Text>
            </Pressable>
          </Link>
        )}
      />
      <View className="pb-4">
        <Button label="Add student" onPress={() => router.push('/students/new')} />
      </View>
    </Screen>
  );
}
