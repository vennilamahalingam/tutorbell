import { Pressable, View } from 'react-native';

import { Icon } from './icon';
import type { IconName } from './icon-paths';
import { FieldLabel } from './text-field';
import { Text } from './text';

/** Looks like a TextField but opens a picker (city, date, time, country code). */
export function SelectField({
  label,
  value,
  placeholder,
  sub,
  trailing,
  icon,
  onPress,
  className = '',
}: {
  label?: string;
  value?: string;
  placeholder?: string;
  /** Small second line under the value (e.g. "8:00 PM Tue in Sydney"). */
  sub?: string;
  trailing?: React.ReactNode;
  icon?: IconName;
  onPress: () => void;
  className?: string;
}) {
  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <Pressable
        onPress={onPress}
        className="min-h-[52px] flex-row items-center gap-2 rounded-lg border border-border bg-surface px-[14px] py-2 active:bg-secondary-pressed"
      >
        {icon ? <Icon name={icon} size={20} color="muted" /> : null}
        <View className="flex-1">
          <Text
            weight={sub ? 'semibold' : 'regular'}
            tabular
            className={`text-[15px] ${value ? '' : 'text-muted'}`}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
          {sub ? (
            <Text tabular className="text-[12px] text-muted">
              {sub}
            </Text>
          ) : null}
        </View>
        {trailing}
      </Pressable>
    </View>
  );
}
