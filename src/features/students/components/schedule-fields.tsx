import { DateTime } from 'luxon';
import { useState } from 'react';
import { View } from 'react-native';

import { useDatePicker, useTimePicker } from '@/components/pickers/pickers';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { DayChips } from '@/components/ui/day-chips';
import { DualTimeCard } from '@/components/ui/dual-time-card';
import { Segmented } from '@/components/ui/segmented';
import { SelectField } from '@/components/ui/select-field';
import { Text } from '@/components/ui/text';
import { FieldLabel } from '@/components/ui/text-field';
import { Icon } from '@/components/ui/icon';
import type { City } from '@/lib/places';
import {
  dateFromWallTime,
  formatTime,
  formatWallTime,
  formatWeekdays,
  isoDate,
  nextOccurrences,
  tutorPickToStudentSchedule,
  wallTimeFromDate,
  weekdaysIn,
  type StudentSchedule,
  type WallTime,
} from '@/lib/time';

/** What the tutor picks — in THEIR time and week. */
export type SchedulePick = {
  weekdays: number[];
  time: WallTime;
  duration: number;
  startDate: Date;
};

export const defaultSchedulePick = (): SchedulePick => ({
  weekdays: [],
  time: { hour: 18, minute: 0 },
  duration: 60,
  startDate: new Date(),
});

const LENGTHS = [30, 45, 60].map((m) => ({ value: m, label: `${m} min` }));

/** Converts the pick into what's stored on the student (their weekdays + local time). */
export function toStudentSchedule(
  pick: SchedulePick,
  tutorZone: string,
  studentZone: string,
): StudentSchedule {
  return tutorPickToStudentSchedule(
    { weekdays: pick.weekdays, time: pick.time, startDate: isoDate(pick.startDate) },
    tutorZone,
    studentZone,
  );
}

/** Day chips · dual-time card · class length · start date (design 2l / 2h). */
export function ScheduleFields({
  value,
  onChange,
  tutorZone,
  studentCity,
  compactLength = false,
}: {
  value: SchedulePick;
  onChange: (v: SchedulePick) => void;
  tutorZone: string;
  studentCity: City;
  /** Add student (2h) shows length beside the time; onboarding (2l) shows a segmented row. */
  compactLength?: boolean;
}) {
  const openTime = useTimePicker();
  const openDate = useDatePicker();
  const set = (patch: Partial<SchedulePick>) => onChange({ ...value, ...patch });
  const [lengthSheet, setLengthSheet] = useState(false);
  const pickTime = () =>
    openTime(dateFromWallTime(value.time), (d) => set({ time: wallTimeFromDate(d) }));

  const hasDays = value.weekdays.length > 0;
  const studentSchedule = toStudentSchedule(value, tutorZone, studentCity.tz);
  const occurrences = hasDays
    ? nextOccurrences(studentSchedule, studentCity.tz, value.weekdays.length)
    : [];
  const theirTime = occurrences[0] ? formatTime(occurrences[0], studentCity.tz) : '—';

  return (
    <View className="gap-5">
      <DayChips value={value.weekdays} onChange={(weekdays) => set({ weekdays })} />

      {compactLength ? (
        // 2h: time field with the student's local time underneath + length box.
        <View className="flex-row gap-2">
          <SelectField
            value={formatWallTime(value.time)}
            sub={
              hasDays
                ? `${theirTime} ${weekdaysIn(occurrences, studentCity.tz)} in ${studentCity.city}`
                : `Pick days to see ${studentCity.city} time`
            }
            onPress={pickTime}
            className="flex-1"
          />
          <SelectField
            value={`${value.duration} min`}
            onPress={() => setLengthSheet(true)}
            className="w-[110px]"
          />
        </View>
      ) : (
        <DualTimeCard
          onPressYou={pickTime}
          you={{
            label: 'Your time',
            time: formatWallTime(value.time),
            sub: hasDays ? formatWeekdays(value.weekdays) : 'Pick days',
          }}
          them={{
            label: studentCity.city,
            time: theirTime,
            sub: hasDays ? weekdaysIn(occurrences, studentCity.tz) : ' ',
          }}
        />
      )}

      {compactLength ? null : (
        <View className="gap-1.5">
          <FieldLabel>Class length</FieldLabel>
          <Segmented
            options={LENGTHS}
            value={value.duration}
            onChange={(duration) => set({ duration })}
          />
        </View>
      )}

      <SelectField
        label="Starts"
        value={DateTime.fromJSDate(value.startDate).toFormat('ccc, d LLL')}
        onPress={() => openDate(value.startDate, (startDate) => set({ startDate }), new Date())}
        trailing={<Icon name="calendar_month" size={20} color="muted" />}
      />

      <BottomSheet visible={lengthSheet} onClose={() => setLengthSheet(false)}>
        <Text weight="semibold" className="mb-4 text-[20px]">
          Class length
        </Text>
        <Segmented
          options={[...LENGTHS, { value: 90, label: '90 min' }]}
          value={value.duration}
          onChange={(duration) => set({ duration })}
        />
        <Button label="Done" onPress={() => setLengthSheet(false)} className="mt-6" />
      </BottomSheet>
    </View>
  );
}

export { LENGTHS as CLASS_LENGTHS };
