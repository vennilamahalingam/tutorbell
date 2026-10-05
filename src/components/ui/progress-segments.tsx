import { View } from 'react-native';

/** Onboarding progress: N segments, 4dp tall, radius 4, gap 6. */
export function ProgressSegments({ total, current }: { total: number; current: number }) {
  return (
    <View className="flex-row gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={`h-1 flex-1 rounded-[4px] ${i < current ? 'bg-primary' : 'bg-border'}`}
        />
      ))}
    </View>
  );
}
