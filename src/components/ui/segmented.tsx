import { Pressable, View } from 'react-native';

import { Text } from './text';

type Props<T extends string | number> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Track #EEEAE2, radius 8, 4dp padding; 40dp options; selected = white, radius 6, 600. */
export function Segmented<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <View className="flex-row rounded-md bg-track p-1">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`h-10 flex-1 items-center justify-center rounded-sm ${selected ? 'bg-surface' : ''}`}
          >
            <Text
              key={selected ? 'on' : 'off'} // remount so stale color classes can't linger
              weight={selected ? 'semibold' : 'regular'}
              tabular
              className={`text-[14px] ${selected ? '' : 'text-muted'}`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
