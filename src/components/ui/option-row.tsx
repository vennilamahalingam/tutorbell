import { Pressable, View } from 'react-native';

import { Icon } from './icon';
import type { IconName } from './icon-paths';
import { Text } from './text';

export type OptionTone = 'success' | 'error' | 'cancel';

const selectedClass: Record<OptionTone, string> = {
  success: 'border-2 border-success-stroke bg-success-bg',
  error: 'border-2 border-error-icon bg-error-bg',
  cancel: 'border-2 border-cancel-icon bg-cancel-bg',
};
const selectedText: Record<OptionTone, string> = {
  success: 'text-success-fg',
  error: 'text-error-fg',
  cancel: 'text-cancel-fg',
};

/**
 * 52dp option row, radius 12dp, 1dp border (design 2d). Selected → 2dp tone border + tone bg.
 * Also used for bottom-sheet action lists (no `selected`).
 */
export function OptionRow({
  icon,
  iconColor = 'primary',
  label,
  onPress,
  selected,
  tone = 'success',
  bordered = true,
  trailing,
}: {
  icon: IconName;
  iconColor?: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
  tone?: OptionTone;
  bordered?: boolean;
  trailing?: React.ReactNode;
}) {
  const box = selected ? selectedClass[tone] : bordered ? 'border border-border bg-surface' : '';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={selected !== undefined ? { selected } : undefined}
      className={`min-h-[52px] flex-row items-center gap-3 rounded-lg px-4 active:bg-secondary-pressed ${box}`}
    >
      <Icon name={icon} size={22} color={iconColor} />
      <View className="flex-1">
        <Text
          key={selected ? 'on' : 'off'}
          weight={selected ? 'semibold' : 'regular'}
          className={`text-[15px] ${selected ? selectedText[tone] : ''}`}
        >
          {label}
        </Text>
      </View>
      {trailing}
    </Pressable>
  );
}
