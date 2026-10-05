import { View } from 'react-native';

import { Text } from './text';

export type BadgeTone = 'success' | 'moved' | 'error' | 'cancel';

const tones: Record<BadgeTone, [string, string]> = {
  success: ['bg-success-bg', 'text-success-fg'],
  moved: ['bg-moved-bg', 'text-moved-fg'],
  error: ['bg-error-bg', 'text-error-fg'],
  cancel: ['bg-cancel-bg', 'text-cancel-fg'],
};

/** Status badge: 12sp/600, 4×8dp padding, radius 8dp. Status colors only — never decoration. */
export function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  const [bg, fg] = tones[tone];
  return (
    <View className={`self-start rounded-md px-2 py-1 ${bg}`}>
      <Text weight="semibold" className={`text-[12px] ${fg}`}>
        {label}
      </Text>
    </View>
  );
}
