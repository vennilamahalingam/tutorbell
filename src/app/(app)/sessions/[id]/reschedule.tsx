import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DateTimeField } from '@/components/ui/date-time-field';
import { useTutorZone } from '@/features/auth/profile';
import { StudentTimeHint } from '@/features/sessions/components/student-time-hint';
import { useReschedule, useSession } from '@/features/sessions/queries';
import {
  formatDateTime,
  nextHourPickerDate,
  pickerDateToUtcIso,
  utcIsoToPickerDate,
} from '@/lib/time';

export default function RescheduleSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session } = useSession(id);
  const tutorZone = useTutorZone();
  const reschedule = useReschedule();

  const [when, setWhen] = useState(nextHourPickerDate);
  useEffect(() => {
    if (session?.starts_at) setWhen(utcIsoToPickerDate(session.starts_at, tutorZone));
  }, [session?.starts_at, tutorZone]);

  if (!session) return <View className="flex-1 bg-surface-muted" />;

  const startsAt = pickerDateToUtcIso(when, tutorZone);
  const previous = session.starts_at ?? session.original_starts_at;

  function submit(newStartsAt: string | null) {
    if (newStartsAt && new Date(newStartsAt) < new Date()) {
      return Alert.alert('That time has passed', 'Pick a time in the future.');
    }
    reschedule.mutate(
      { session: session!, startsAt: newStartsAt },
      { onSuccess: () => router.back(), onError: (e) => Alert.alert('Could not save', e.message) },
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface-muted" contentContainerClassName="gap-4 p-4">
      <Text className="text-lg font-semibold text-ink">{session.student.name}</Text>
      {previous ? (
        <Text className="text-ink-muted">Was {formatDateTime(previous, tutorZone)}</Text>
      ) : null}
      <DateTimeField label={`New time (your time, ${tutorZone})`} value={when} onChange={setWhen} />
      <StudentTimeHint
        startsAtUtc={startsAt}
        studentName={session.student.name}
        studentZone={session.student.timezone}
        tutorZone={tutorZone}
      />
      <Button label="Move class" onPress={() => submit(startsAt)} loading={reschedule.isPending} />
      {session.status !== 'to_reschedule' ? (
        <Button label="Decide later" variant="secondary" onPress={() => submit(null)} />
      ) : null}
    </ScrollView>
  );
}
