import { Pressable, View } from 'react-native';

import { Text } from './text';

/** ISO weekdays: 1 = Mon … 7 = Sun. */
const DAYS = [
  { day: 1, label: 'M', name: 'Monday' },
  { day: 2, label: 'T', name: 'Tuesday' },
  { day: 3, label: 'W', name: 'Wednesday' },
  { day: 4, label: 'T', name: 'Thursday' },
  { day: 5, label: 'F', name: 'Friday' },
  { day: 6, label: 'S', name: 'Saturday' },
  { day: 7, label: 'S', name: 'Sunday' },
];

/** M T W T F S S — 40dp circles, 6dp gap. */
export function DayChips({
  value,
  onChange,
}: {
  value: number[];
  onChange: (days: number[]) => void;
}) {
  function toggle(day: number) {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort());
  }
  return (
    <View className="flex-row justify-between">
      {DAYS.map(({ day, label, name }) => {
        const selected = value.includes(day);
        return (
          <Pressable
            key={day}
            onPress={() => toggle(day)}
            accessibilityLabel={name}
            accessibilityState={{ selected }}
            className={`h-10 w-10 items-center justify-center rounded-full ${selected ? 'bg-primary' : 'border border-border bg-surface'}`}
          >
            <Text
              key={selected ? 'on' : 'off'} // remount so stale color classes can't linger
              weight={selected ? 'semibold' : 'regular'}
              className={`text-[13px] ${selected ? 'text-on-primary' : ''}`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
