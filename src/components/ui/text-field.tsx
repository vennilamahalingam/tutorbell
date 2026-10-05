import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/theme-provider';
import { Text } from './text';

type Props = TextInputProps & { label?: string; trailing?: React.ReactNode; className?: string };

/** 52dp input, radius 12dp, 2dp teal border when focused. Label 13sp/600 muted, 6dp above. */
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, trailing, className = '', onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <View
        className={`h-[52px] flex-row items-center rounded-lg bg-surface px-[14px] ${focused ? 'border-2 border-primary' : 'border border-border'}`}
      >
        <TextInput
          ref={ref}
          className="flex-1 font-sans text-[15px] text-text"
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {trailing}
      </View>
    </View>
  );
});

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text weight="semibold" className="text-[13px] text-muted">
      {children}
    </Text>
  );
}
