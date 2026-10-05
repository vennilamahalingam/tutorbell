import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/theme-provider';
import type { light } from '@/theme/colors';
import { iconPaths, type IconName } from './icon-paths';

type Props = {
  name: IconName;
  size?: number;
  /** A theme token name (e.g. 'primary', 'muted') or a raw color. Defaults to 'text'. */
  color?: keyof typeof light | (string & {});
};

/** Material Symbols Rounded (weight 400, fill 0), as the design specifies. */
export function Icon({ name, size = 22, color = 'text' }: Props) {
  const { colors } = useTheme();
  const fill = (colors as Record<string, string>)[color] ?? color;
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960">
      <Path d={iconPaths[name]} fill={fill} />
    </Svg>
  );
}
