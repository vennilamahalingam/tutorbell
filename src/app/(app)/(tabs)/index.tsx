import { router } from 'expo-router';
import { DateTime } from 'luxon';
import { useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { useTutorZone } from '@/features/auth/profile';
import { RemindButton, type RemindButtonHandle } from '@/features/reminders/remind-button';
import { useRemind } from '@/features/reminders/use-remind';
import type { SessionWithStudent } from '@/features/sessions/api';
import { ClassActionsSheet } from '@/features/sessions/components/class-actions-sheet';
import { MarkAttendanceSheet } from '@/features/sessions/components/mark-attendance-sheet';
import {
  needsAttendanceTitle,
  relativeDayTime,
  sessionBadge,
  upcomingTimeShifts,
} from '@/features/sessions/insights';
import {
  useNeedsAttendance,
  usePendingReschedule,
  useTodaySessions,
  useUpcoming,
} from '@/features/sessions/queries';
import { formatStudentLocal, formatTime } from '@/lib/time';

const firstName = (name: string) => name.trim().split(/\s+/)[0];
const openReschedule = (id: string) =>
  router.push({ pathname: '/sessions/[id]/reschedule', params: { id } });

/** 2c — Today (home). Sections with no items are hidden. */
export default function TodayScreen() {
  const zone = useTutorZone();
  const today = useTodaySessions(zone);
  const upcoming = useUpcoming();
  const needs = useNeedsAttendance();
  const pending = usePendingReschedule();

  const classes = today.data ?? [];
  const needsList = needs.data ?? [];
  const pendingList = pending.data ?? [];
  const shifts = upcomingTimeShifts(upcoming.data ?? [], zone);

  const [actionFor, setActionFor] = useState<SessionWithStudent | null>(null);
  const [attendanceQueue, setAttendanceQueue] = useState<SessionWithStudent[] | null>(null);
  const bells = useRef<Record<string, RemindButtonHandle | null>>({});
  const remind = useRemind(classes);

  async function sendReminder(s: SessionWithStudent) {
    if (await remind(s)) bells.current[s.id]?.wiggle();
  }

  const loading = today.isLoading;
  const refreshing = today.isRefetching || needs.isRefetching || pending.isRefetching;
  const refresh = () =>
    Promise.all([today.refetch(), needs.refetch(), pending.refetch(), upcoming.refetch()]);
  const nothingAtAll =
    !loading && classes.length === 0 && needsList.length === 0 && pendingList.length === 0;
  const nextUp = (upcoming.data ?? []).find((s) => !classes.some((c) => c.id === s.id));

  return (
    <Screen>
      <ScreenHeader
        title={DateTime.now().setZone(zone).toFormat('cccc, d LLL')}
        subtitle={`Today · ${classes.length} ${classes.length === 1 ? 'class' : 'classes'}`}
        trailing={
          <IconButton icon="add" label="Add student" onPress={() => router.push('/students/new')} />
        }
      />
      <ScrollView
        contentContainerClassName="gap-3 px-4 pb-8 grow"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {shifts.map((n) => (
          <Notice key={n.key}>{n.message}</Notice>
        ))}

        {needsList.length > 0 ? (
          <View className="gap-2">
            <SectionLabel className="mt-1">Needs attendance</SectionLabel>
            <Card>
              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <Text weight="semibold" className="text-[15px]">
                    {needsAttendanceTitle(needsList, zone)}
                  </Text>
                  <Text tabular className="mt-0.5 text-[13px] text-muted" numberOfLines={2}>
                    {needsList
                      .slice(0, 4)
                      .map((s) => `${firstName(s.student.name)} ${formatTime(s.starts_at!, zone)}`)
                      .join(' · ')}
                    {needsList.length > 4 ? ` +${needsList.length - 4}` : ''}
                  </Text>
                </View>
                <Button
                  size="sm"
                  variant="accent"
                  label="Mark"
                  onPress={() => setAttendanceQueue([...needsList])}
                />
              </View>
            </Card>
          </View>
        ) : null}

        {pendingList.length > 0 ? (
          <View className="gap-2">
            <SectionLabel className="mt-1">To reschedule</SectionLabel>
            {pendingList.map((s) => (
              <Card key={s.id} dashed>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text weight="semibold" className="text-[15px]">
                      {firstName(s.student.name)} ·{' '}
                      {DateTime.fromISO(s.moved_from ?? s.slot_at)
                        .setZone(zone)
                        .toFormat('ccc')}{' '}
                      class
                    </Text>
                    <Text className="mt-0.5 text-[13px] text-muted">
                      Decided later
                      {s.requested_by
                        ? ` · asked by ${s.requested_by === 'student' ? 'student' : 'you'}`
                        : ''}
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    variant="accent"
                    label="Pick time"
                    onPress={() => openReschedule(s.id)}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        {classes.length > 0 ? (
          <View className="gap-3">
            <SectionLabel className="mt-1">Classes</SectionLabel>
            {classes.map((s) => (
              <ClassCard
                key={s.id}
                session={s}
                zone={zone}
                bellRef={(h) => {
                  bells.current[s.id] = h;
                }}
                onPress={() => setActionFor(s)}
                onRemind={() => sendReminder(s)}
              />
            ))}
          </View>
        ) : null}

        {nothingAtAll ? <EmptyDay nextUp={nextUp} zone={zone} /> : null}
      </ScrollView>

      <ClassActionsSheet
        session={actionFor}
        tutorZone={zone}
        onClose={() => setActionFor(null)}
        onRemind={() => {
          const s = actionFor!;
          setActionFor(null);
          sendReminder(s);
        }}
        onMark={() => {
          const s = actionFor!;
          setActionFor(null);
          setAttendanceQueue([s]);
        }}
        onReschedule={() => {
          const s = actionFor!;
          setActionFor(null);
          openReschedule(s.id);
        }}
      />

      {attendanceQueue ? (
        <MarkAttendanceSheet
          queue={attendanceQueue}
          tutorZone={zone}
          onClose={() => setAttendanceQueue(null)}
        />
      ) : null}
    </Screen>
  );
}

function ClassCard({
  session,
  zone,
  bellRef,
  onPress,
  onRemind,
}: {
  session: SessionWithStudent;
  zone: string;
  bellRef: (h: RemindButtonHandle | null) => void;
  onPress: () => void;
  onRemind: () => void;
}) {
  const startsAt = session.starts_at!;
  const badge = sessionBadge(session, zone);
  const done = session.status !== 'scheduled';
  return (
    <Card onPress={onPress}>
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text weight="semibold" tabular className="text-[20px]" style={{ letterSpacing: -0.2 }}>
            {formatTime(startsAt, zone)}
          </Text>
          <Text weight="semibold" className="mt-0.5 text-[15px]">
            {session.student.name}
          </Text>
          <Text tabular className="mt-0.5 text-[13px] text-muted">
            {formatStudentLocal(startsAt, session.student.timezone, session.student.city)}
          </Text>
        </View>
        {badge ? <Badge tone={badge.tone} label={badge.label} /> : null}
      </View>
      {done ? null : (
        <View className="mt-4 flex-row gap-2">
          <RemindButton ref={bellRef} sent={!!session.reminder_sent_at} onPress={onRemind} />
          <Button
            size="md"
            variant="secondary"
            label="Reschedule"
            onPress={() => openReschedule(session.id)}
            className="flex-1"
          />
        </View>
      )}
    </Card>
  );
}

/** 2j — empty day. */
function EmptyDay({ nextUp, zone }: { nextUp?: SessionWithStudent; zone: string }) {
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
      {nextUp?.starts_at ? (
        <Text tabular className="text-[14px] text-muted">
          Next up: {firstName(nextUp.student.name)}, {relativeDayTime(nextUp.starts_at, zone)}.
        </Text>
      ) : null}
    </View>
  );
}
