import { ActivityIndicator, Pressable, View } from 'react-native';

import { useTheme } from '@/theme/theme-provider';
import { Icon } from './icon';
import type { IconName } from './icon-paths';
import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'accent';
type Size = 'lg' | 'md' | 'sm';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** lg 52dp (screen CTA) · md 44dp (in-card) · sm 40dp (inline "Mark", "Pick time") */
  size?: Size;
  icon?: IconName;
  /** Override the icon color, e.g. 'brass' for the Remind bell. */
  iconColor?: string;
  /** Custom leading element (e.g. Google logo, animated bell). */
  leading?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const height: Record<Size, string> = { lg: 'h-[52px]', md: 'h-11', sm: 'h-10 px-[14px]' };

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary active:bg-primary-pressed',
  secondary: 'border border-secondary-border bg-surface active:bg-secondary-pressed',
  accent: 'border border-primary bg-surface active:bg-primary-container',
};

const textClass: Record<Variant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-text',
  accent: 'text-primary',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconColor,
  leading,
  loading,
  disabled,
  className = '',
}: Props) {
  const { colors } = useTheme();
  const fg =
    variant === 'primary'
      ? colors['on-primary']
      : variant === 'accent'
        ? colors.primary
        : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      className={`flex-row items-center justify-center gap-2 rounded-md px-4 ${height[size]} ${variantClass[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {leading}
          {icon ? <Icon name={icon} size={20} color={iconColor ?? fg} /> : null}
          <Text
            weight="semibold"
            numberOfLines={1}
            className={`${size === 'sm' ? 'text-[13px]' : 'text-[15px]'} ${textClass[variant]}`}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** 44dp round icon button (e.g. Today's add button). */
export function IconButton({
  icon,
  onPress,
  color = 'primary',
  bordered = true,
  label,
}: {
  icon: IconName;
  onPress: () => void;
  color?: string;
  bordered?: boolean;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={4}
      className={`h-11 w-11 items-center justify-center rounded-full active:bg-secondary-pressed ${bordered ? 'border border-border bg-surface' : ''}`}
    >
      <View>
        <Icon name={icon} size={22} color={color} />
      </View>
    </Pressable>
  );
}
