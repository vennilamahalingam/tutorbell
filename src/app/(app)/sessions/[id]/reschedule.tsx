import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTimePicker } from '@/components/pickers/pickers';
import { Button } from '@/components/ui/button';
import { DualTimeCard } from '@/components/ui/dual-time-card';
import { Notice } from '@/components/ui/notice';
import { TopBar } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { useSnackbar } from '@/components/ui/snackbar';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { FieldLabel } from '@/components/ui/text-field';
import { useTutorZone } from '@/features/auth/profile';
import { openWhatsApp } from '@/features/reminders/whatsapp';
import { listSessionsBetween } from '@/features/sessions/api';
import { findClash } from '@/features/sessions/insights';
import { useReschedule, useSession } from '@/features/sessions/queries';
import { useBlockedTimes } from '@/features/settings/blocked-times';
import { dateFromWallTime, formatDateTime, wallTimeFromDate, type WallTime } from '@/lib/time';
import type { RequestedBy } from '@/types/database';

const STRIP_DAYS = 21;

/** 2e — Reschedule: date strip, both times, clash warning, who asked, WhatsApp the new time. */
export default function RescheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session } = useSession(id);
  const zone = useTutorZone();
  const reschedule = useReschedule();
  const snackbar = useSnackbar();
  const openTime = useTimePicker();
  const { data: blocked = [] } = useBlockedTimes();

  const today = DateTime.now().setZone(zone).startOf('day');
  const [day, setDay] = useState(today); // selected date (tutor's calendar)
  const [time, setTime] = useState<WallTime>({ hour: 18, minute: 0 }); // tutor's time
  const [requestedBy, setRequestedBy] = useState<RequestedBy>('student');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // Start from the class's current slot.
  useEffect(() => {
    const base = session?.starts_at ?? session?.moved_from ?? session?.slot_at;
    if (!base) return;
    const dt = DateTime.fromISO(base).setZone(zone);
    setTime({ hour: dt.hour, minute: dt.minute });
    setDay(dt.startOf('day') < today ? today : dt.startOf('day'));
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = day.set({ hour: time.hour, minute: time.minute });
  const startIso = start.toUTC().toISO()!;

  // Other classes around the chosen day, for the clash check.
  const around = useQuery({
    queryKey: ['sessions', 'around', day.toISODate()],
    queryFn: () =>
      listSessionsBetween(
        day.minus({ days: 1 }).toUTC().toISO()!,
        day.plus({ days: 2 }).toUTC().toISO()!,
      ),
  });
  const clash = useMemo(
    () =>
      session
        ? findClash(
            startIso,
            session.duration_minutes,
            zone,
            around.data ?? [],
            blocked,
            session.id,
          )
        : null,
    [startIso, session, zone, around.data, blocked],
  );

  if (!session) return <View className="flex-1 bg-bg" />;

  const firstName = session.student.name.trim().split(/\s+/)[0];
  const studentStart = start.setZone(session.student.timezone);
  const was = session.starts_at ?? session.moved_from ?? session.slot_at;
  const hasPhone = !!session.student.whatsapp_number;

  async function move() {
    if (start < DateTime.now())
      return Alert.alert('That time has passed', 'Pick a time in the future.');
    try {
      await reschedule.mutateAsync({ session: session!, startsAt: startIso, requestedBy });
      if (sendWhatsApp && hasPhone) {
        await openWhatsApp(
          session!.student.whatsapp_number,
          `Your class has moved to ${studentStart.toFormat('ccc d LLL')} at ${studentStart.toFormat('h:mm a')}.`,
        );
      }
      snackbar(
        `Done. ${firstName} now rings on ${start.toFormat('ccc')} at ${start.toFormat('h:mm a')}.`,
      );
      router.back();
    } catch (e) {
      Alert.alert("Couldn't save", e instanceof Error ? e.message : String(e));
    }
  }

  function decideLater() {
    reschedule.mutate(
      { session: session!, startsAt: null, requestedBy },
      {
        onSuccess: () => {
          snackbar(`${firstName}'s class is in To reschedule.`);
          router.back();
        },
        onError: (e) => Alert.alert("Couldn't save", e.message),
      },
    );
  }

  const days = Array.from({ length: STRIP_DAYS }, (_, i) => today.plus({ days: i }));

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <TopBar title={`Reschedule ${firstName}`} onClose={() => router.back()} />
      <ScrollView contentContainerClassName="gap-4 pb-6">
        <Text tabular className="px-5 text-[13px] text-muted">
          Was {formatDateTime(was, zone)}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4"
        >
          {days.map((d) => {
            const selected = d.hasSame(day, 'day');
            return (
              <Pressable
                key={d.toISODate()}
                onPress={() => setDay(d)}
                accessibilityLabel={d.toFormat('cccc d LLLL')}
                accessibilityState={{ selected }}
                className={`h-16 w-[52px] items-center justify-center rounded-lg ${selected ? 'bg-primary' : 'border border-border bg-surface'}`}
              >
                <Text
                  key={`${selected}d`}
                  className={`text-[12px] ${selected ? 'text-on-primary' : 'text-muted'}`}
                >
                  {d.toFormat('ccc')}
                </Text>
                <Text
                  key={`${selected}n`}
                  weight="semibold"
                  tabular
                  className={`text-[17px] ${selected ? 'text-on-primary' : ''}`}
                >
                  {d.toFormat('d')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="gap-4 px-4">
          <DualTimeCard
            onPressYou={() => openTime(dateFromWallTime(time), (d) => setTime(wallTimeFromDate(d)))}
            you={{
              label: 'Your time',
              time: start.toFormat('h:mm a'),
              sub: start.toFormat('ccc d'),
            }}
            them={{
              label: session.student.city,
              time: studentStart.toFormat('h:mm a'),
              sub: studentStart.toFormat('ccc d'),
            }}
          />
          <Text className="-mt-2 px-1 text-[12px] text-muted">Tap your time to change it.</Text>

          {clash ? <Notice tone="error">{clash}</Notice> : null}

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

          <View className="min-h-[52px] flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-[15px]">Send new time on WhatsApp?</Text>
              {!hasPhone ? (
                <Text className="text-[12px] text-muted">No WhatsApp number for {firstName}.</Text>
              ) : null}
            </View>
            <Switch value={sendWhatsApp && hasPhone} onChange={setSendWhatsApp} />
          </View>
        </View>
      </ScrollView>

      <View className="flex-row gap-3 px-4 pb-6 pt-2">
        {session.status !== 'pending_reschedule' ? (
          <Button
            label="Decide later"
            variant="secondary"
            onPress={decideLater}
            className="flex-1"
          />
        ) : null}
        <Button
          label="Move class"
          onPress={move}
          loading={reschedule.isPending}
          className="flex-1"
        />
      </View>
    </SafeAreaView>
  );
}
