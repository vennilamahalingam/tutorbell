import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from './button';
import { Text } from './text';

/** Paper background + top safe area. Bottom is handled by the tab bar or the screen's CTA. */
export function Screen({
  children,
  edges = ['top'],
}: PropsWithChildren<{ edges?: ('top' | 'bottom')[] }>) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-bg">
      {children}
    </SafeAreaView>
  );
}

/** Title 20sp/600 + subtitle 13sp muted, 20dp sides, 12dp vertical; optional trailing action. */
export function ScreenHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center px-5 py-3">
      <View className="flex-1">
        <Text weight="semibold" className="text-[20px]">
          {title}
        </Text>
        {subtitle ? <Text className="mt-0.5 text-[13px] text-muted">{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

/** 56dp top bar: close/back (48dp touch) + 18sp/600 title + optional trailing. */
export function TopBar({
  title,
  onClose,
  kind = 'close',
  trailing,
}: {
  title?: string;
  onClose: () => void;
  kind?: 'close' | 'back';
  trailing?: React.ReactNode;
}) {
  return (
    <View className="h-14 flex-row items-center gap-1 px-1">
      <IconButton
        icon={kind === 'close' ? 'close' : 'arrow_back'}
        onPress={onClose}
        color="text"
        bordered={false}
        label={kind === 'close' ? 'Close' : 'Back'}
      />
      <Text weight="semibold" className="flex-1 text-[18px]" numberOfLines={1}>
        {title ?? ''}
      </Text>
      {trailing}
    </View>
  );
}
