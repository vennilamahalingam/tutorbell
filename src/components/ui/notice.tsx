import { View } from 'react-native';

import { Icon } from './icon';
import { Text } from './text';

/** Calm banner. 'notice' = DST/timezone heads-up, 'error' = clash warning. */
export function Notice({
  tone = 'notice',
  children,
}: {
  tone?: 'notice' | 'error';
  children: string;
}) {
  const isNotice = tone === 'notice';
  return (
    <View
      className={`flex-row items-start gap-3 rounded-lg px-4 py-3 ${isNotice ? 'border border-notice-border bg-notice-bg' : 'bg-error-bg'}`}
    >
      <Icon
        name={isNotice ? 'schedule' : 'warning'}
        size={20}
        color={isNotice ? 'notice-icon' : 'error-icon'}
      />
      <Text
        className={`flex-1 text-[13px] leading-[19px] ${isNotice ? 'text-notice-fg' : 'text-error-fg'}`}
      >
        {children}
      </Text>
    </View>
  );
}
