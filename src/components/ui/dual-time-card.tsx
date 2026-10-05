import { Pressable, View } from 'react-native';

import { Text } from './text';

type Side = { label: string; time: string; sub?: string };

/**
 * Two halves split by a 1dp divider: tutor's time (primary, ink) | student's city (muted).
 * Design 2l / 2e. Tap the left half to change the time.
 */
export function DualTimeCard({
  you,
  them,
  onPressYou,
}: {
  you: Side;
  them: Side;
  onPressYou?: () => void;
}) {
  return (
    <View className="flex-row rounded-xl border border-border bg-surface">
      <Pressable
        onPress={onPressYou}
        disabled={!onPressYou}
        accessibilityRole={onPressYou ? 'button' : undefined}
        accessibilityLabel={onPressYou ? `Your time ${you.time}. Change time` : undefined}
        className="flex-1 rounded-l-xl p-4 active:bg-secondary-pressed"
      >
        <Half side={you} primary />
      </Pressable>
      <View className="w-px bg-border" />
      <View className="flex-1 p-4">
        <Half side={them} />
      </View>
    </View>
  );
}

function Half({ side, primary }: { side: Side; primary?: boolean }) {
  return (
    <>
      <Text className="text-[13px] text-muted" numberOfLines={1}>
        {side.label}
      </Text>
      <Text
        weight="semibold"
        tabular
        className={`mt-0.5 text-[22px] ${primary ? '' : 'text-muted'}`}
        style={{ letterSpacing: -0.2 }}
      >
        {side.time}
      </Text>
      {side.sub ? (
        <Text tabular className="mt-0.5 text-[12px] text-muted" numberOfLines={1}>
          {side.sub}
        </Text>
      ) : null}
    </>
  );
}
