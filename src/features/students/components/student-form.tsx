import { DateTime } from 'luxon';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { FieldLabel } from '@/components/ui/text-field';
import { cities, countries, countryByName, type City } from '@/lib/places';
import { nextOccurrences, type StudentSchedule } from '@/lib/time';
import type { Student } from '@/types/database';
import type { NewStudent } from '../api';
import { ScheduleFields, toStudentSchedule, type SchedulePick } from './schedule-fields';
import { StudentFields, toE164, type StudentBasics } from './student-fields';

/** Shared Add (2h) / Edit form. Calls `onSubmit` with the row to save. */
export function StudentForm({
  title,
  submitLabel,
  initialBasics,
  initialPick,
  tutorZone,
  saving,
  onSubmit,
  onClose,
  footerNote,
}: {
  title: string;
  submitLabel: string;
  initialBasics: StudentBasics;
  initialPick: SchedulePick;
  tutorZone: string;
  saving: boolean;
  onSubmit: (row: NewStudent) => void;
  onClose: () => void;
  footerNote?: string;
}) {
  const [basics, setBasics] = useState(initialBasics);
  const [pick, setPick] = useState(initialPick);
  const [showErrors, setShowErrors] = useState(false);

  function save() {
    const city = basics.city;
    if (!basics.name.trim() || !city) return setShowErrors(true);
    if (pick.weekdays.length === 0)
      return Alert.alert('Pick at least one day', 'Tap the days they have class.');
    const schedule = toStudentSchedule(pick, tutorZone, city.tz);
    onSubmit({
      name: basics.name.trim(),
      whatsapp_number: toE164(basics.dial, basics.phone),
      city: city.city,
      country: city.country || null,
      timezone: city.tz,
      duration_minutes: pick.duration,
      schedule_weekdays: schedule.weekdays,
      schedule_time: schedule.time,
      start_date: schedule.startDate,
    });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <TopBar title={title} onClose={onClose} />
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
          {footerNote ? <Text className="px-1 text-[12px] text-muted">{footerNote}</Text> : null}
        </ScrollView>
        <View className="px-4 pb-6 pt-2">
          <Button label={submitLabel} onPress={save} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Pre-fill the form from a saved student (schedule converted back to the tutor's week/time). */
export function studentToForm(
  student: Student,
  tutorZone: string,
): { basics: StudentBasics; pick: SchedulePick } {
  const city: City = cities.find((c) => c.city === student.city && c.tz === student.timezone) ?? {
    city: student.city,
    country: student.country ?? '',
    tz: student.timezone,
  };

  // Split "+447700900123" into the matching dial code + the rest (prefer the student's country).
  const number = student.whatsapp_number ?? '';
  const own = countryByName(student.country);
  const dial =
    (own && number.startsWith(own.dial) ? own : null) ??
    [...countries]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => number.startsWith(c.dial)) ??
    own ??
    countries[1];
  const phone = number.startsWith(dial.dial)
    ? number.slice(dial.dial.length)
    : number.replace(/^\+/, '');

  // Next occurrence of each weekly slot, seen in the tutor's zone → their weekdays + time.
  const schedule: StudentSchedule = {
    weekdays: student.schedule_weekdays,
    time: student.schedule_time ?? '18:00:00',
    startDate: DateTime.now().setZone(student.timezone).toISODate()!,
  };
  const occ = student.schedule_weekdays.length
    ? nextOccurrences(schedule, student.timezone, student.schedule_weekdays.length).map((iso) =>
        DateTime.fromISO(iso).setZone(tutorZone),
      )
    : [];

  return {
    basics: { name: student.name, dial, phone, city },
    pick: {
      weekdays: [...new Set(occ.map((o) => o.weekday))].sort(),
      time: occ[0] ? { hour: occ[0].hour, minute: occ[0].minute } : { hour: 18, minute: 0 },
      duration: student.duration_minutes,
      startDate: new Date(),
    },
  };
}
