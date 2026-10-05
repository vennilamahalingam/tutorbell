import { Text as RNText, type TextProps } from 'react-native';

import { light } from '@/theme/colors';

type Props = TextProps & {
  className?: string;
  /** The design uses two weights only. */
  weight?: 'regular' | 'semibold';
  /** Tabular numerals — use for every time and number. */
  tabular?: boolean;
};

const colorClass = new RegExp(`(^|\\s)text-(${Object.keys(light).join('|')})(\\s|$|/)`);

/** Base text: Plus Jakarta Sans, ink color unless a color class is given (text-muted…). */
export function Text({ weight = 'regular', tabular, className = '', style, ...props }: Props) {
  const color = colorClass.test(className) ? '' : 'text-text';
  return (
    <RNText
      className={`${weight === 'semibold' ? 'font-semi' : 'font-sans'} ${color} ${className}`}
      style={[tabular ? { fontVariant: ['tabular-nums'] } : null, style]}
      {...props}
    />
  );
}
