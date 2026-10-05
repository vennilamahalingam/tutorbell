import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChoiceChips } from '@/components/ui/choice-chips';
import { DateTimeField } from '@/components/ui/date-time-field';
import { useTutorZone } from '@/features/auth/profile';
import { StudentTimeHint } from '@/features/sessions/components/student-time-hint';
import { useCreateSession } from '@/features/sessions/queries';
import { useStudent } from '@/features/students/queries';
import { nextHourPickerDate, pickerDateToUtcIso } from '@/lib/time';

const DURATIONS = [30, 45, 60, 90].map((m) => ({ value: m, label: `${m} min` }));

export default function NewSessionScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { data: student } = useStudent(studentId);
  const tutorZone = useTutorZone();
  const create = useCreateSession();

  const [when, setWhen] = useState(nextHourPickerDate);
  const [duration, setDuration] = useState<number | null>(null);
  const minutes = duration ?? student?.default_duration_minutes ?? 60;
  const startsAt = pickerDateToUtcIso(when, tutorZone);

  function save() {
    if (new Date(startsAt) < new Date()) {
      return Alert.alert('That time has passed', 'Pick a time in the future.');
    }
    create.mutate(
      { student_id: studentId, starts_at: startsAt, duration_minutes: minutes },
      { onSuccess: () => router.back(), onError: (e) => Alert.alert('Could not save', e.message) },
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface-muted" contentContainerClassName="gap-4 p-4">
      <Text className="text-lg font-semibold text-ink">Class with {student?.name ?? '…'}</Text>
      <DateTimeField label={`When (your time, ${tutorZone})`} value={when} onChange={setWhen} />
      {student ? (
        <StudentTimeHint
          startsAtUtc={startsAt}
          studentName={student.name}
          studentZone={student.timezone}
          tutorZone={tutorZone}
        />
      ) : null}
      <ChoiceChips label="Duration" options={DURATIONS} value={minutes} onChange={setDuration} />
      <Button label="Add class" onPress={save} loading={create.isPending} />
    </ScrollView>
  );
}
