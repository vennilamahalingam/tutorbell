import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/screen';
import { FieldLabel } from '@/components/ui/text-field';
import { useTutorZone } from '@/features/auth/profile';
import {
  defaultSchedulePick,
  ScheduleFields,
  toStudentSchedule,
  type SchedulePick,
} from '@/features/students/components/schedule-fields';
import {
  StudentFields,
  toE164,
  type StudentBasics,
} from '@/features/students/components/student-fields';
import { useCreateStudent } from '@/features/students/queries';
import { countries } from '@/lib/places';

/** 2h — Add student. */
export default function NewStudentScreen() {
  const tutorZone = useTutorZone();
  const create = useCreateStudent();
  const [basics, setBasics] = useState<StudentBasics>({
    name: '',
    dial: countries[1],
    phone: '',
    city: null,
  });
  const [pick, setPick] = useState<SchedulePick>(defaultSchedulePick);
  const [showErrors, setShowErrors] = useState(false);

  function save() {
    const city = basics.city;
    if (!basics.name.trim() || !city) return setShowErrors(true);
    if (pick.weekdays.length === 0)
      return Alert.alert('Pick at least one day', 'Tap the days they have class.');
    const schedule = toStudentSchedule(pick, tutorZone, city.tz);
    create.mutate(
      {
        name: basics.name.trim(),
        whatsapp_number: toE164(basics.dial, basics.phone),
        city: city.city,
        country: city.country || null,
        timezone: city.tz,
        duration_minutes: pick.duration,
        schedule_weekdays: schedule.weekdays,
        schedule_time: schedule.time,
        start_date: schedule.startDate,
      },
      {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert("Couldn't save", e.message),
      },
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <TopBar title="New student" onClose={() => router.back()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerClassName="gap-4 px-4 pb-6" keyboardShouldPersistTaps="handled">
          <StudentFields
            value={basics}
            onChange={setBasics}
            tutorZone={tutorZone}
            showLiveTime={false}
            showErrors={showErrors}
          />
          {basics.city ? (
            <View className="gap-1.5">
              <FieldLabel>Weekly schedule</FieldLabel>
              <ScheduleFields
                value={pick}
                onChange={setPick}
                tutorZone={tutorZone}
                studentCity={basics.city}
                compactLength
              />
            </View>
          ) : null}
        </ScrollView>
        <View className="px-4 pb-6 pt-2">
          <Button label="Save student" onPress={save} loading={create.isPending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
