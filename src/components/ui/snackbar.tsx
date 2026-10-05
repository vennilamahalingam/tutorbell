import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './text';

const SnackbarContext = createContext<(message: string) => void>(() => {});

/** Dark snackbar, radius 12dp, shown for 2.2s. Sits above the bottom nav. */
export function SnackbarProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (msg: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
          setMessage(null),
        );
      }, 2200);
    },
    [opacity],
  );

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          style={{ opacity, bottom: 88 + insets.bottom }}
          className="absolute left-4 right-4"
        >
          <View className="rounded-lg bg-snackbar px-4 py-3.5">
            <Text className="text-[14px] text-on-snackbar">{message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => useContext(SnackbarContext);
