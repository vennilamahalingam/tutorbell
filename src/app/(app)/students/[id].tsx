import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { TopBar } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { useTutorZone } from '@/features/auth/profile';
import { useStudentSessions } from '@/features/sessions/queries';
import { useStudent } from '@/features/students/queries';
import { formatDateTime, formatStudentLocal, formatWeekdays, nowIn } from '@/lib/time';

/** Student details (2g) — INTERIM: header + upcoming. Summary, past sessions, edit come next. */
export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student } = useStudent(id);
  const { data: sessions = [] } = useStudentSessions(id);
  const tutorZone = useTutorZone();

  const now = Date.now();
  const upcoming = sessions
    .filter((s) => s.starts_at && new Date(s.starts_at).getTime() > now && s.status === 'scheduled')
    .sort((a, b) => a.starts_at!.localeCompare(b.starts_at!))
    .slice(0, 5);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <TopBar kind="back" onClose={() => router.back()} />
      {student ? (
        <ScrollView contentContainerClassName="gap-4 px-4 pb-8">
          <View className="px-1">
            <Text weight="semibold" className="text-[24px]">
              {student.name}
            </Text>
            <Text tabular className="mt-1 text-[13px] text-muted">
              {[
                student.city,
                `${nowIn(student.timezone).time} ${nowIn(student.timezone).day} there`,
                formatWeekdays(student.schedule_weekdays),
                `${student.duration_minutes} min`,
              ].join(' · ')}
            </Text>
          </View>
          <SectionLabel>Upcoming</SectionLabel>
          <Card row>
            {upcoming.length === 0 ? (
              <Text className="text-[14px] text-muted">
                {student.paused ? 'Paused.' : 'Nothing scheduled.'}
              </Text>
            ) : (
              upcoming.map((s, i) => (
                <View key={s.id} className={i ? 'mt-3 border-t border-divider pt-3' : ''}>
                  <Text weight="semibold" tabular className="text-[17px]">
                    {formatDateTime(s.starts_at!, tutorZone)}
                  </Text>
                  <Text tabular className="text-[13px] text-muted">
                    {formatStudentLocal(s.starts_at!, student.timezone, student.city)}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
