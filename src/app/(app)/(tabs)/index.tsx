import { router } from 'expo-router';
import { DateTime } from 'luxon';
import { FlatList, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-label';
import { useSnackbar } from '@/components/ui/snackbar';
import { Text } from '@/components/ui/text';
import { useProfile, useTutorZone } from '@/features/auth/profile';
import { openWhatsAppReminder } from '@/features/reminders/whatsapp';
import type { SessionWithStudent } from '@/features/sessions/api';
import { useMarkReminderSent, useTodaySessions } from '@/features/sessions/queries';
import { formatStudentLocal, formatTime } from '@/lib/time';

/**
 * Today (2c) — INTERIM: class cards + empty state. Still to build next session:
 * needs-attendance, to-reschedule, DST notice, class actions sheet, bell wiggle.
 */
export default function TodayScreen() {
  const zone = useTutorZone();
  const { data: sessions = [], isLoading, refetch, isRefetching } = useTodaySessions(zone);
  const today = DateTime.now().setZone(zone);
  const count = sessions.length;

  return (
    <Screen>
      <ScreenHeader
        title={today.toFormat('cccc, d LLL')}
        subtitle={`Today · ${count} ${count === 1 ? 'class' : 'classes'}`}
        trailing={
          <IconButton icon="add" label="Add student" onPress={() => router.push('/students/new')} />
        }
      />
      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerClassName="gap-3 px-4 pb-6 grow"
        ListHeaderComponent={count ? <SectionLabel className="mb-0">Classes</SectionLabel> : null}
        ListEmptyComponent={isLoading ? null : <EmptyDay />}
        renderItem={({ item }) => <ClassCard session={item} tutorZone={zone} />}
      />
    </Screen>
  );
}

function ClassCard({ session, tutorZone }: { session: SessionWithStudent; tutorZone: string }) {
  const { data: profile } = useProfile();
  const markSent = useMarkReminderSent();
  const snackbar = useSnackbar();
  const startsAt = session.starts_at!;
  const firstName = session.student.name.split(' ')[0];

  async function remind() {
    const opened = await openWhatsAppReminder(session, profile?.reminder_template);
    if (!opened) return snackbar(`Add a WhatsApp number for ${firstName} first.`);
    markSent.mutate(session.id);
    snackbar(`Reminder sent to ${firstName} on WhatsApp.`);
  }

  return (
    <Card>
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text weight="semibold" tabular className="text-[20px]" style={{ letterSpacing: -0.2 }}>
            {formatTime(startsAt, tutorZone)}
          </Text>
          <Text weight="semibold" className="mt-0.5 text-[15px]">
            {session.student.name}
          </Text>
          <Text tabular className="mt-0.5 text-[13px] text-muted">
            {formatStudentLocal(startsAt, session.student.timezone, session.student.city)}
          </Text>
        </View>
        {session.reminder_sent_at ? (
          <Badge tone="success" label="Reminder sent" />
        ) : session.moved_from ? (
          <Badge
            tone="moved"
            label={`Moved from ${DateTime.fromISO(session.moved_from).setZone(tutorZone).toFormat('ccc')}`}
          />
        ) : null}
      </View>
      <View className="mt-4 flex-row gap-2">
        <Button
          size="md"
          label={session.reminder_sent_at ? 'Remind again' : 'Remind'}
          icon="notifications"
          iconColor="#E9A23B"
          onPress={remind}
          className="flex-1"
        />
        <Button
          size="md"
          variant="secondary"
          label="Reschedule"
          onPress={() =>
            router.push({ pathname: '/sessions/[id]/reschedule', params: { id: session.id } })
          }
          className="flex-1"
        />
      </View>
    </Card>
  );
}

/** 2j — empty day. */
function EmptyDay() {
  return (
    <View className="flex-1 justify-center gap-3 px-2 py-16">
      <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-brass-container">
        <View style={{ transform: [{ rotate: '-14deg' }] }}>
          <Icon name="notifications_paused" size={36} color="brass-strong" />
        </View>
      </View>
      <Text weight="semibold" className="text-[18px]">
        No classes today. The bell's taking a nap.
      </Text>
    </View>
  );
}
