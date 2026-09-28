import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface-muted">
      <View className="flex-1 px-4 pt-2">{children}</View>
    </SafeAreaView>
  );
}
