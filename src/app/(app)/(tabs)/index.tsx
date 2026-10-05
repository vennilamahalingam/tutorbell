import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useTutorZone } from '@/features/auth/profile';
import { openWhatsAppReminder } from '@/features/reminders/whatsapp';
import type { SessionWithStudent } from '@/features/sessions/api';
import { useMarkReminderSent, useSetStatus, useTodaySessions } from '@/features/sessions/queries';
import { formatTime } from '@/lib/time';

export default function TodayScreen() {
  const zone = useTutorZone();
  const { data: sessions = [], isLoading, refetch, isRefetching } = useTodaySessions(zone);

  return (
    <Screen>
      <Text className="mb-4 text-2xl font-bold text-ink">Today</Text>
      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerClassName="gap-3 pb-6 grow"
        ListEmptyComponent={
          isLoading ? null : <EmptyState title="No classes today" body="Enjoy the quiet." />
        }
        renderItem={({ item }) => <SessionCard session={item} zone={zone} />}
      />
    </Screen>
  );
}

function SessionCard({ session, zone }: { session: SessionWithStudent; zone: string }) {
  const setStatus = useSetStatus();
  const markSent = useMarkReminderSent();

  async function sendReminder() {
    if (await openWhatsAppReminder(session)) markSent.mutate(session.id);
  }

  return (
    <View className="rounded-2xl bg-surface p-4">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-lg font-semibold text-ink">{session.student.name}</Text>
        <Text className="text-ink-muted">
          {session.starts_at && formatTime(session.starts_at, zone)}
        </Text>
      </View>
      <Text className="mt-1 text-sm text-ink-muted">Status: {session.status}</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <Chip
          label={session.reminder_sent_at ? 'Reminder sent' : 'Send reminder'}
          onPress={sendReminder}
        />
        <Chip
          label="Attended"
          onPress={() => setStatus.mutate({ id: session.id, status: 'attended' })}
        />
        <Chip
          label="Absent"
          onPress={() => setStatus.mutate({ id: session.id, status: 'absent' })}
        />
        <Chip
          label="Reschedule"
          onPress={() =>
            router.push({ pathname: '/sessions/[id]/reschedule', params: { id: session.id } })
          }
        />
      </View>
    </View>
  );
}

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full bg-brand-soft px-3 py-1.5 active:opacity-70"
    >
      <Text className="text-sm font-medium text-brand">{label}</Text>
    </Pressable>
  );
}
