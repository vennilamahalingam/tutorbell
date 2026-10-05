import { router, useLocalSearchParams } from 'expo-router';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDatePicker, useTimePicker } from '@/components/pickers/pickers';
import { Button } from '@/components/ui/button';
import { DualTimeCard } from '@/components/ui/dual-time-card';
import { TopBar } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { SelectField } from '@/components/ui/select-field';
import { useSnackbar } from '@/components/ui/snackbar';
import { Text } from '@/components/ui/text';
import { FieldLabel } from '@/components/ui/text-field';
import { useTutorZone } from '@/features/auth/profile';
import { useReschedule, useSession } from '@/features/sessions/queries';
import { formatDateTime, formatTime, pickerDateToUtcIso } from '@/lib/time';
import type { RequestedBy } from '@/types/database';

/**
 * Reschedule (2e) — INTERIM: date + time pickers, both times, who asked, decide later.
 * Still to build: date strip, clash warning, "send new time on WhatsApp".
 */
export default function RescheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session } = useSession(id);
  const tutorZone = useTutorZone();
  const reschedule = useReschedule();
  const snackbar = useSnackbar();
  const openDate = useDatePicker();
  const openTime = useTimePicker();

  const [when, setWhen] = useState(() => new Date());
  const [requestedBy, setRequestedBy] = useState<RequestedBy>('student');

  useEffect(() => {
    const base = session?.starts_at ?? session?.slot_at;
    if (!base) return;
    const dt = DateTime.fromISO(base).setZone(tutorZone);
    setWhen(new Date(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute));
  }, [session?.starts_at, session?.slot_at, tutorZone]);

  if (!session) return <View className="flex-1 bg-bg" />;

  const firstName = session.student.name.split(' ')[0];
  const startsAt = pickerDateToUtcIso(when, tutorZone);
  const was = session.starts_at ?? session.moved_from ?? session.slot_at;
  const tutorDay = DateTime.fromISO(startsAt).setZone(tutorZone).toFormat('ccc d');
  const studentDay = DateTime.fromISO(startsAt).setZone(session.student.timezone).toFormat('ccc d');

  function submit(newStartsAt: string | null) {
    if (newStartsAt && new Date(newStartsAt) < new Date()) {
      return Alert.alert('That time has passed', 'Pick a time in the future.');
    }
    reschedule.mutate(
      { session: session!, startsAt: newStartsAt, requestedBy },
      {
        onSuccess: () => {
          snackbar(
            newStartsAt
              ? `Done. ${firstName} now rings on ${DateTime.fromISO(newStartsAt).setZone(tutorZone).toFormat('ccc')} at ${formatTime(newStartsAt, tutorZone)}.`
              : `${firstName}'s class is in To reschedule.`,
          );
          router.back();
        },
        onError: (e) => Alert.alert("Couldn't save", e.message),
      },
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <TopBar title={`Reschedule ${firstName}`} onClose={() => router.back()} />
      <ScrollView contentContainerClassName="gap-4 px-4 pb-6">
        <Text tabular className="px-1 text-[13px] text-muted">
          Was {formatDateTime(was, tutorZone)}
        </Text>
        <View className="flex-row gap-2">
          <SelectField
            value={DateTime.fromJSDate(when).toFormat('ccc d LLL')}
            icon="calendar_month"
            onPress={() => openDate(when, (d) => setWhen(mergeDate(when, d)), new Date())}
            className="flex-1"
          />
          <SelectField
            value={DateTime.fromJSDate(when).toFormat('h:mm a')}
            icon="schedule"
            onPress={() => openTime(when, (t) => setWhen(mergeTime(when, t)))}
            className="flex-1"
          />
        </View>
        <DualTimeCard
          you={{ label: 'Your time', time: formatTime(startsAt, tutorZone), sub: tutorDay }}
          them={{
            label: session.student.city,
            time: formatTime(startsAt, session.student.timezone),
            sub: studentDay,
          }}
        />
        <View className="gap-1.5">
          <FieldLabel>Who asked?</FieldLabel>
          <Segmented<RequestedBy>
            options={[
              { value: 'student', label: 'Student' },
              { value: 'tutor', label: 'Me' },
            ]}
            value={requestedBy}
            onChange={setRequestedBy}
          />
        </View>
      </ScrollView>
      <View className="flex-row gap-3 px-4 pb-6 pt-2">
        {session.status !== 'pending_reschedule' ? (
          <Button
            label="Decide later"
            variant="secondary"
            onPress={() => submit(null)}
            className="flex-1"
          />
        ) : null}
        <Button
          label="Move class"
          onPress={() => submit(startsAt)}
          loading={reschedule.isPending}
          className="flex-1"
        />
      </View>
    </SafeAreaView>
  );
}

const mergeDate = (base: Date, d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), base.getHours(), base.getMinutes());
const mergeTime = (base: Date, t: Date) =>
  new Date(base.getFullYear(), base.getMonth(), base.getDate(), t.getHours(), t.getMinutes());
