import { Link } from 'expo-router';
import { FlatList, Pressable, Text } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useTutorZone } from '@/features/auth/profile';
import { useToReschedule } from '@/features/sessions/queries';
import { formatDateTime } from '@/lib/time';

/** The "Decide later" list. Tap a class to pick its new time. */
export default function RescheduleScreen() {
  const zone = useTutorZone();
  const { data = [], isLoading } = useToReschedule();

  return (
    <Screen>
      <Text className="mb-4 text-2xl font-bold text-ink">To reschedule</Text>
      <FlatList
        data={data}
        keyExtractor={(s) => s.id}
        contentContainerClassName="gap-2 pb-6 grow"
        ListEmptyComponent={isLoading ? null : <EmptyState title="Nothing pending" />}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/sessions/[id]/reschedule', params: { id: item.id } }} asChild>
            <Pressable className="rounded-2xl bg-surface p-4 active:opacity-80">
              <Text className="font-semibold text-ink">{item.student.name}</Text>
              {item.original_starts_at ? (
                <Text className="text-sm text-ink-muted">
                  Was {formatDateTime(item.original_starts_at, zone)}
                </Text>
              ) : null}
            </Pressable>
          </Link>
        )}
      />
    </Screen>
  );
}
