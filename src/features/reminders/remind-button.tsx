import { useImperativeHandle, useRef, type Ref } from 'react';
import { Animated, Easing } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/theme/theme-provider';

export type RemindButtonHandle = { wiggle: () => void };

/**
 * Primary "Remind" button with the brass bell. The one delight in the app:
 * the bell wiggles 0 → −18° → 14° → −8° → 4° → 0 over 600ms when a reminder is sent.
 */
export function RemindButton({
  sent,
  onPress,
  ref,
}: {
  sent: boolean;
  onPress: () => void;
  ref?: Ref<RemindButtonHandle>;
}) {
  const { colors } = useTheme();
  const rot = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    wiggle: () => {
      rot.setValue(0);
      Animated.timing(rot, {
        toValue: 1,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    },
  }));

  const rotate = rot.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: ['0deg', '-18deg', '14deg', '-8deg', '4deg', '0deg'],
  });

  return (
    <Button
      size="md"
      label={sent ? 'Remind again' : 'Remind'}
      onPress={onPress}
      className="flex-1"
      leading={
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="notifications" size={20} color={colors.brass} />
        </Animated.View>
      }
    />
  );
}
