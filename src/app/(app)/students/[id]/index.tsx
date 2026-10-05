import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { OptionRow } from '@/components/ui/option-row';
import { TopBar } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-label';
import { useSnackbar } from '@/components/ui/snackbar';
import { Text } from '@/components/ui/text';
import { useTutorZone } from '@/features/auth/profile';
import { monthSummary, relativeDayTime, sessionBadge } from '@/features/sessions/insights';
import { useStudentSessions } from '@/features/sessions/queries';
import { useDeleteStudent, useStudent, useUpdateStudent } from '@/features/students/queries';
import { formatStudentLocal, nextOccurrences, nowIn, weekdaysIn } from '@/lib/time';
import { useNow } from '@/lib/use-now';
import { DateTime } from 'luxon';

/** 2g — Student details. */
export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student } = useStudent(id);
  const { data: sessions = [] } = useStudentSessions(id);
  const zone = useTutorZone();
  const update = useUpdateStudent();
  const remove = useDeleteStudent();
  const snackbar = useSnackbar();
  const [menu, setMenu] = useState(false);
  useNow();

  if (!student) return <SafeAreaView className="flex-1 bg-bg" />;

  const now = Date.now();
  const upcoming = sessions
    .filter((s) => s.status === 'scheduled' && s.starts_at && new Date(s.starts_at).getTime() > now)
    .sort((a, b) => a.starts_at!.localeCompare(b.starts_at!));
  const next = upcoming[0];
  const past = sessions
    .filter(
      (s) =>
        s.status !== 'pending_reschedule' &&
        (s.status !== 'scheduled' || (s.starts_at && new Date(s.starts_at).getTime() <= now)),
    )
    .sort((a, b) => (b.starts_at ?? b.slot_at).localeCompare(a.starts_at ?? a.slot_at))
    .slice(0, 20);
  const summary = monthSummary(sessions, zone);

  // "Mon, Wed, Fri" in the tutor's week (tutor-first, like everywhere else).
  const slotDays =
    student.schedule_weekdays.length && student.schedule_time
      ? weekdaysIn(
          nextOccurrences(
            {
              weekdays: student.schedule_weekdays,
              time: student.schedule_time,
              startDate: DateTime.now().setZone(student.timezone).toISODate()!,
            },
            student.timezone,
            student.schedule_weekdays.length,
          ),
          zone,
        )
      : '';
  const local = nowIn(student.timezone);
  const meta = [
    student.city,
    `${local.time} ${local.day} there`,
    slotDays,
    `${student.duration_minutes} min`,
  ]
    .filter(Boolean)
    .join(' · ');

  function togglePause() {
    const paused = !student!.paused;
    update.mutate(
      { id: student!.id, patch: { paused } },
      {
        onSuccess: () =>
          snackbar(
            paused
              ? `${student!.name.split(' ')[0]} is paused. No new classes.`
              : 'Resumed. Classes are back on.',
          ),
        onError: (e) => Alert.alert("Couldn't save", e.message),
      },
    );
  }

  function confirmDelete() {
    setMenu(false);
    Alert.alert(
      `Delete ${student!.name}?`,
      'Their classes and notes are deleted too. This can’t be undone.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            remove.mutate(student!.id, {
              onSuccess: () => router.back(),
              onError: (e) => Alert.alert("Couldn't delete", e.message),
            }),
        },
      ],
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <TopBar
        kind="back"
        onClose={() => router.back()}
        trailing={
          <IconButton
            icon="more_vert"
            label="More"
            color="text"
            bordered={false}
            onPress={() => setMenu(true)}
          />
        }
      />
      <ScrollView contentContainerClassName="gap-4 px-4 pb-6">
        <View className="px-1">
          <Text weight="semibold" className="text-[24px]">
            {student.name}
          </Text>
          <Text tabular className="mt-1 text-[13px] text-muted">
            {meta}
          </Text>
          {student.paused ? (
            <View className="mt-2">
              <Badge tone="cancel" label="Paused" />
            </View>
          ) : null}
        </View>

        <Card>
          <Text weight="semibold" className="text-[13px] text-muted">
            {summary.label}
          </Text>
          <View className="mt-3 flex-row">
            <Stat value={summary.attended} label="Attended" color="text-success-fg" />
            <Stat value={summary.moved} label="Moved" color="text-moved-fg" />
            <Stat value={summary.absent} label="Absent" color="text-error-fg" />
            <Stat value={summary.cancelled} label="Cancelled" color="text-cancel-fg" />
          </View>
        </Card>

        <SectionLabel>Upcoming</SectionLabel>
        {next?.starts_at ? (
          <Card
            row
            onPress={() =>
              router.push({ pathname: '/sessions/[id]/reschedule', params: { id: next.id } })
            }
          >
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text weight="semibold" tabular className="text-[17px]">
                  {relativeDayTime(next.starts_at, zone)}
                </Text>
                <Text tabular className="text-[13px] text-muted">
                  {formatStudentLocal(next.starts_at, student.timezone, student.city)}
                </Text>
              </View>
              <Icon name="chevron_right" size={22} color="muted" />
            </View>
          </Card>
        ) : (
          <Card row>
            <Text className="text-[14px] text-muted">
              {student.paused ? 'Paused — no classes coming up.' : 'Nothing scheduled.'}
            </Text>
          </Card>
        )}

        {past.length > 0 ? (
          <>
            <SectionLabel>Past sessions</SectionLabel>
            <Card row>
              {past.map((s, i) => {
                const at = s.starts_at ?? s.slot_at;
                const badge =
                  sessionBadge(s, zone) ??
                  (s.status === 'scheduled'
                    ? { label: 'Not marked', tone: 'cancel' as const }
                    : null);
                return (
                  <View key={s.id} className={i ? 'mt-3 border-t border-divider pt-3' : ''}>
                    <View className="flex-row items-center justify-between gap-2">
                      <Text weight="semibold" tabular className="text-[14px]">
                        {DateTime.fromISO(at).setZone(zone).toFormat('ccc d · h:mm a')}
                      </Text>
                      {badge ? <Badge tone={badge.tone} label={badge.label} /> : null}
                    </View>
                    {s.note ? <Text className="mt-1 text-[13px] text-muted">{s.note}</Text> : null}
                  </View>
                );
              })}
            </Card>
          </>
        ) : null}
      </ScrollView>

      <View className="flex-row gap-3 px-4 pb-6 pt-2">
        <Button
          variant="secondary"
          label={student.paused ? 'Resume student' : 'Pause student'}
          onPress={togglePause}
          loading={update.isPending}
          className="flex-1"
        />
        <Button
          label="Edit schedule"
          onPress={() =>
            router.push({ pathname: '/students/[id]/edit', params: { id: student.id } })
          }
          className="flex-1"
        />
      </View>

      <BottomSheet visible={menu} onClose={() => setMenu(false)}>
        <View className="gap-1">
          <OptionRow
            bordered={false}
            icon="edit"
            label="Edit"
            onPress={() => {
              setMenu(false);
              router.push({ pathname: '/students/[id]/edit', params: { id: student.id } });
            }}
          />
          <OptionRow
            bordered={false}
            icon="delete"
            iconColor="error-icon"
            label="Delete"
            onPress={confirmDelete}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View className="flex-1 items-center">
      <Text weight="semibold" tabular className={`text-[20px] ${color}`}>
        {value}
      </Text>
      <Text className="text-[11px] text-muted">{label}</Text>
    </View>
  );
}
