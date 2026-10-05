import { useEffect, useRef, type PropsWithChildren } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeScope } from '@/theme/theme-provider';

/**
 * White sheet, top radius 20dp, 36×4 handle, scrim rgba(29,36,51,0.4).
 * Android back closes it (onRequestClose).
 */
export function BottomSheet({
  visible,
  onClose,
  children,
}: PropsWithChildren<{ visible: boolean; onClose: () => void }>) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slide.setValue(0);
      Animated.timing(slide, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <ThemeScope>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end"
        >
          <Pressable
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(29,36,51,0.4)' }}
            onPress={onClose}
            accessibilityLabel="Close"
          />
          {/* Animated.View takes no className — style the inner View instead. */}
          <Animated.View style={{ transform: [{ translateY }] }}>
            <View
              style={{ paddingBottom: 28 + insets.bottom }}
              className="rounded-t-2xl bg-surface px-5 pt-2.5"
            >
              <View className="mb-4 h-1 w-9 self-center rounded-full bg-border" />
              {children}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </ThemeScope>
    </Modal>
  );
}
