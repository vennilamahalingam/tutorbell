import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useUpdateProfile } from '@/features/auth/profile';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { OnboardingStep } from '@/features/onboarding/onboarding-step';
import {
  defaultSchedulePick,
  ScheduleFields,
  toStudentSchedule,
  type SchedulePick,
} from '@/features/students/components/schedule-fields';
import { toE164 } from '@/features/students/components/student-fields';
import { useCreateStudent } from '@/features/students/queries';

/** 2l — Step 3: weekly classes, then land on Today. */
export default function ScheduleStep() {
  const { draft } = useOnboarding();
  const tutorZone = draft.tutorCity.tz;
  const [pick, setPick] = useState<SchedulePick>(defaultSchedulePick);
  const createStudent = useCreateStudent();
  const updateProfile = useUpdateProfile();

  const city = draft.studentCity;
  const firstName = draft.studentName.trim().split(/\s+/)[0] || 'they';
  const saving = createStudent.isPending || updateProfile.isPending;

  if (!city) {
    // Step 2 wasn't completed (e.g. app restarted mid-onboarding).
    return <Redirect href="/student" />;
  }

  async function finish() {
    if (!city) return;
    if (pick.weekdays.length === 0) {
      return Alert.alert('Pick at least one day', `Tap the days ${firstName} has class.`);
    }
    const schedule = toStudentSchedule(pick, tutorZone, city.tz);
    try {
      await createStudent.mutateAsync({
        name: draft.studentName.trim(),
        whatsapp_number: toE164(draft.dial, draft.phone),
        city: city.city,
        country: city.country || null,
        timezone: city.tz,
        duration_minutes: pick.duration,
        schedule_weekdays: schedule.weekdays,
        schedule_time: schedule.time,
        start_date: schedule.startDate,
      });
      // Flipping onboarded_at swaps the root navigator over to Today.
      await updateProfile.mutateAsync({ onboarded_at: new Date().toISOString() });
    } catch (e) {
      Alert.alert("Couldn't save", e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <OnboardingStep
      step={3}
      title={`When does ${firstName} have class?`}
      body="Pick the days and your time. We'll work out theirs."
      footer={
        <>
          <Button label="Go to Today" onPress={finish} loading={saving} />
          <Text className="mt-3 text-center text-[12px] text-muted">
            Add more students any time from Students.
          </Text>
        </>
      }
    >
      <ScheduleFields value={pick} onChange={setPick} tutorZone={tutorZone} studentCity={city} />
    </OnboardingStep>
  );
}
