import { Pressable, Text, View } from 'react-native';

type Props<T extends string | number> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function ChoiceChips<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-ink-muted">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              className={`rounded-full px-4 py-2 ${selected ? 'bg-brand' : 'bg-surface'}`}
            >
              <Text className={selected ? 'font-semibold text-white' : 'text-ink'}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
