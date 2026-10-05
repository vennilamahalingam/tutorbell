import { Switch as RNSwitch } from 'react-native';

import { useTheme } from '@/theme/theme-provider';

/** M3-style switch tinted: on = primary, off = border, white knob. */
export function Switch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: colors.primary, false: colors.border }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.border}
    />
  );
}
